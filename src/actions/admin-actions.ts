"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types/api";
import { canModerate, canModerateCollege, isAdmin } from "@/lib/permissions";

async function getModerator() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  if (!canModerate(session.user)) return null;
  return session.user;
}

export async function moderateListing(
  listingId: string,
  reason?: string
): Promise<ApiResponse<{ id: string }>> {
  const user = await getModerator();
  if (!user) return { success: false, error: "Forbidden" };

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      collegeId: true,
      seller: { select: { name: true } },
    },
  });
  if (!listing) return { success: false, error: "Listing not found" };

  // Moderators are college-scoped; admins can act on any listing
  if (!canModerateCollege(user, listing.collegeId)) {
    return { success: false, error: "Forbidden" };
  }

  if (isAdmin(user)) {
    // Log first (no FK on listingId), then hard delete
    await db.moderationLog.create({
      data: {
        moderatorId: user.id,
        listingId,
        listingTitle: listing.title,
        sellerName: listing.seller.name,
        collegeId: listing.collegeId,
        reason: reason?.trim() || null,
      },
    });
    await db.listing.delete({ where: { id: listingId } });
  } else {
    await db.$transaction([
      db.listing.update({
        where: { id: listingId },
        data: { status: "ARCHIVED" },
      }),
      db.moderationLog.create({
        data: {
          moderatorId: user.id,
          listingId,
          listingTitle: listing.title,
          sellerName: listing.seller.name,
          collegeId: listing.collegeId,
          reason: reason?.trim() || null,
        },
      }),
    ]);
  }

  revalidatePath("/admin/listings");
  revalidatePath("/listings");
  revalidatePath(`/listings/${listingId}`);
  return { success: true, data: { id: listingId } };
}

// Store admin/mod actions

export async function verifyStore(
  storeId: string
): Promise<ApiResponse<{ id: string }>> {
  const user = await getModerator();
  if (!user) return { success: false, error: "Forbidden" };

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { id: true, collegeId: true },
  });
  if (!store) return { success: false, error: "Store not found" };

  if (!canModerateCollege(user, store.collegeId)) {
    return { success: false, error: "Forbidden" };
  }

  await db.store.update({
    where: { id: storeId },
    data: { isVerified: true, status: "ACTIVE" },
  });

  revalidatePath("/admin/stores");
  revalidatePath("/stores");
  revalidatePath(`/stores/${storeId}`);
  return { success: true, data: { id: storeId } };
}

// Moderator → archives (soft delete). Admin → hard deletes.
export async function removeStore(
  storeId: string
): Promise<ApiResponse<{ id: string }>> {
  const user = await getModerator();
  if (!user) return { success: false, error: "Forbidden" };

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { id: true, collegeId: true },
  });
  if (!store) return { success: false, error: "Store not found" };

  if (!canModerateCollege(user, store.collegeId)) {
    return { success: false, error: "Forbidden" };
  }

  if (isAdmin(user)) {
    await db.store.delete({ where: { id: storeId } });
  } else {
    await db.store.update({
      where: { id: storeId },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date(),
        archivedById: user.id,
      },
    });
  }

  revalidatePath("/admin/stores");
  revalidatePath("/stores");
  return { success: true, data: { id: storeId } };
}

// Moderator → archives review. Admin → hard deletes.
export async function removeStoreReview(
  reviewId: string
): Promise<ApiResponse<{ id: string }>> {
  const user = await getModerator();
  if (!user) return { success: false, error: "Forbidden" };

  const review = await db.storeReview.findUnique({
    where: { id: reviewId },
    select: { id: true, store: { select: { collegeId: true } } },
  });
  if (!review) return { success: false, error: "Review not found" };

  if (!canModerateCollege(user, review.store.collegeId)) {
    return { success: false, error: "Forbidden" };
  }

  if (isAdmin(user)) {
    await db.storeReview.delete({ where: { id: reviewId } });
  } else {
    await db.storeReview.update({
      where: { id: reviewId },
      data: { isArchived: true, archivedAt: new Date(), archivedById: user.id },
    });
  }

  revalidatePath("/admin/stores");
  return { success: true, data: { id: reviewId } };
}

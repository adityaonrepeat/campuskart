"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkImagesAreSafe, checkTextIsSafe } from "@/lib/moderation";
import { listingCreateRatelimit } from "@/lib/rate-limit";
import { createListingSchema, updateListingSchema } from "@/types/listing";
import type { ApiResponse } from "@/types/api";
import type { Listing } from "@prisma/client";
import type { CreateListingInput, UpdateListingInput } from "@/types/listing";

const utapi = new UTApi();

async function getAuthUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return session.user;
}

export async function createListing(
  input: CreateListingInput
): Promise<ApiResponse<Listing>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { success: rateLimitOk } = await listingCreateRatelimit.limit(user.id);
  if (!rateLimitOk) {
    return {
      success: false,
      error: "You've created too many listings. Try again later.",
      code: "RATE_LIMITED",
    };
  }

  const parsed = createListingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  try {
    const textSafe = await checkTextIsSafe(data.title, data.description ?? "");
    if (!textSafe) {
      await utapi.deleteFiles(data.imageKeys);
      return {
        success: false,
        error: "Your listing contains inappropriate text.",
        code: "TEXT_FLAGGED",
      };
    }
  } catch (err) {
    console.error("[createListing] text moderation failed:", err);
    await utapi.deleteFiles(data.imageKeys);
    return {
      success: false,
      error: "Content moderation is temporarily unavailable. Please try again shortly.",
      code: "MODERATION_UNAVAILABLE",
    };
  }

  let moderation: { safe: boolean; flaggedIndex?: number };
  try {
    moderation = await checkImagesAreSafe(data.images);
  } catch (err) {
    console.error("[createListing] image moderation failed:", err);
    await utapi.deleteFiles(data.imageKeys);
    return {
      success: false,
      error: "Image moderation is temporarily unavailable. Please try again shortly.",
      code: "MODERATION_UNAVAILABLE",
    };
  }
  if (!moderation.safe) {
    await utapi.deleteFiles(data.imageKeys);
    return {
      success: false,
      error: "One or more images were flagged as inappropriate.",
      code: "IMAGE_FLAGGED",
    };
  }

  const listing = await db.listing.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      images: data.images,
      category: data.category,
      condition: data.condition,
      listingType: data.listingType,
      sellerId: user.id,
      collegeId: user.collegeId,
    },
  });

  revalidatePath("/listings");
  return { success: true, data: listing };
}

export async function updateListing(
  listingId: string,
  input: UpdateListingInput
): Promise<ApiResponse<Listing>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = updateListingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, title: true, description: true, images: true },
  });
  if (!existing) return { success: false, error: "Listing not found" };
  if (existing.sellerId !== user.id) return { success: false, error: "Forbidden" };

  const data = parsed.data;

  if (data.title !== undefined || data.description !== undefined) {
    try {
      const textSafe = await checkTextIsSafe(
        data.title ?? existing.title,
        data.description ?? existing.description ?? ""
      );
      if (!textSafe) {
        return {
          success: false,
          error: "Your listing contains inappropriate text.",
          code: "TEXT_FLAGGED",
        };
      }
    } catch (err) {
      console.error("[updateListing] text moderation failed:", err);
      return {
        success: false,
        error: "Content moderation is temporarily unavailable. Please try again shortly.",
        code: "MODERATION_UNAVAILABLE",
      };
    }
  }

  if (data.images && data.images.length > 0) {
    let moderation: { safe: boolean; flaggedIndex?: number };
    try {
      moderation = await checkImagesAreSafe(data.images);
    } catch (err) {
      console.error("[updateListing] image moderation failed:", err);
      return {
        success: false,
        error: "Image moderation is temporarily unavailable. Please try again shortly.",
        code: "MODERATION_UNAVAILABLE",
      };
    }
    if (!moderation.safe) {
      if (data.imageKeys) await utapi.deleteFiles(data.imageKeys);
      return {
        success: false,
        error: "One or more images were flagged as inappropriate.",
        code: "IMAGE_FLAGGED",
      };
    }
  }

  const listing = await db.listing.update({
    where: { id: listingId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.images !== undefined && { images: data.images }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.condition !== undefined && { condition: data.condition }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  // Delete old UploadThing files after successfully replacing images
  if (data.images && data.images.length > 0 && existing.images.length > 0) {
    const oldKeys = existing.images
      .map((url) => url.split("/").pop())
      .filter((k): k is string => Boolean(k));
    if (oldKeys.length > 0) void utapi.deleteFiles(oldKeys);
  }

  revalidatePath("/listings");
  revalidatePath(`/listings/${listingId}`);
  return { success: true, data: listing };
}

export async function deleteListing(
  listingId: string
): Promise<ApiResponse<{ id: string }>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const existing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true },
  });
  if (!existing) return { success: false, error: "Listing not found" };
  if (existing.sellerId !== user.id) return { success: false, error: "Forbidden" };

  await db.listing.update({
    where: { id: listingId },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/listings");
  return { success: true, data: { id: listingId } };
}

export async function markListingSold(
  listingId: string
): Promise<ApiResponse<{ id: string }>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const existing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true },
  });
  if (!existing) return { success: false, error: "Listing not found" };
  if (existing.sellerId !== user.id) return { success: false, error: "Forbidden" };

  await db.listing.update({
    where: { id: listingId },
    data: { status: "SOLD" },
  });

  revalidatePath("/orders");
  revalidatePath("/listings");
  revalidatePath(`/listings/${listingId}`);
  return { success: true, data: { id: listingId } };
}

"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createStoreSchema,
  updateStoreSchema,
  createReviewSchema,
} from "@/types/store";
import type { ApiResponse } from "@/types/api";
import type { Store, StoreReview } from "@prisma/client";
import type { CreateStoreInput, UpdateStoreInput, CreateReviewInput } from "@/types/store";

const utapi = new UTApi();

const DEFAULT_QUICK_REPLIES = [
  "Order confirmed ✅",
  "Yes, available!",
  "Sold out ❌",
  "Have to wait ⏳",
];

async function getAuthUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return session.user;
}

export async function createStore(
  input: CreateStoreInput
): Promise<ApiResponse<Store>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const existing = await db.store.findUnique({ where: { ownerId: user.id } });
  if (existing) {
    return { success: false, error: "You already have a store.", code: "STORE_EXISTS" };
  }

  const parsed = createStoreSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const store = await db.store.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      phone: data.phone,
      whatsapp: data.whatsapp,
      location: data.location,
      mapUrl: data.mapUrl,
      hours: data.hours,
      quickReplies: DEFAULT_QUICK_REPLIES,
      tags: data.tags,
      images: data.images,
      ownerId: user.id,
      collegeId: user.collegeId,
    },
  });

  revalidatePath("/stores");
  return { success: true, data: store };
}

export async function updateStore(
  storeId: string,
  input: UpdateStoreInput
): Promise<ApiResponse<Store>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const existing = await db.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true, images: true },
  });
  if (!existing) return { success: false, error: "Store not found" };
  if (existing.ownerId !== user.id) return { success: false, error: "Forbidden" };

  const parsed = updateStoreSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const store = await db.store.update({
    where: { id: storeId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.mapUrl !== undefined && { mapUrl: data.mapUrl }),
      ...(data.hours !== undefined && { hours: data.hours }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.images !== undefined && { images: data.images }),
    },
  });

  if (data.images && data.images.length > 0 && existing.images.length > 0) {
    const removedUrls = existing.images.filter((u) => !data.images!.includes(u));
    const oldKeys = removedUrls
      .map((url) => url.split("/").pop())
      .filter((k): k is string => Boolean(k));
    if (oldKeys.length > 0) void utapi.deleteFiles(oldKeys);
  }

  revalidatePath("/stores");
  revalidatePath(`/stores/${storeId}`);
  return { success: true, data: store };
}

export async function submitStoreReview(
  storeId: string,
  input: CreateReviewInput
): Promise<ApiResponse<StoreReview>> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true, status: true },
  });
  if (!store) return { success: false, error: "Store not found" };
  if (store.status !== "ACTIVE") {
    return { success: false, error: "This store is not available.", code: "STORE_NOT_ACTIVE" };
  }
  if (store.ownerId === user.id) {
    return { success: false, error: "You cannot review your own store." };
  }

  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const review = await db.storeReview.upsert({
    where: { storeId_userId: { storeId, userId: user.id } },
    create: {
      storeId,
      userId: user.id,
      rating: data.rating,
      body: data.body,
    },
    update: {
      rating: data.rating,
      body: data.body,
      isArchived: false,
      archivedAt: null,
      archivedById: null,
    },
  });

  revalidatePath(`/stores/${storeId}`);
  return { success: true, data: review };
}

import { z } from "zod";
import { Prisma } from "@prisma/client";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const STORE_CATEGORIES = [
  "FOOD_DRINKS",
  "STATIONERY",
  "CLOTHING",
  "ELECTRONICS",
  "SERVICES",
  "HEALTH_BEAUTY",
  "BOOKS",
  "OTHER",
] as const;

export const STORE_CATEGORY_LABELS: Record<(typeof STORE_CATEGORIES)[number], string> = {
  FOOD_DRINKS: "Food & Drinks",
  STATIONERY: "Stationery",
  CLOTHING: "Clothing",
  ELECTRONICS: "Electronics",
  SERVICES: "Services",
  HEALTH_BEAUTY: "Health & Beauty",
  BOOKS: "Books",
  OTHER: "Other",
};

// ─── Zod schemas ──────────────────────────────────────────────────────────────

// Empty string → undefined transforms keep field types clean (no `unknown`)
const optionalUrl = z
  .union([z.string().url("Must be a valid URL"), z.literal(""), z.undefined()])
  .transform((v): string | undefined => (v === "" ? undefined : v));

const optionalPhone = z
  .union([
    z.string().min(7, "Phone number too short").max(15, "Phone number too long"),
    z.literal(""),
    z.undefined(),
  ])
  .transform((v): string | undefined => (v === "" ? undefined : v));

const optionalText = (max: number) =>
  z
    .union([z.string().max(max), z.literal(""), z.undefined()])
    .transform((v): string | undefined => (v === "" ? undefined : v));

export const createStoreSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters").max(60),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500),
  category: z.enum(STORE_CATEGORIES),
  phone: optionalPhone,
  whatsapp: optionalPhone,
  location: optionalText(200),
  mapUrl: optionalUrl,
  hours: optionalText(100),
  quickReplies: z.array(z.string().max(100)).max(8).default([]),
  images: z.array(z.string().url("Invalid image URL")).max(10).default([]),
  imageKeys: z.array(z.string()).max(10).default([]),
});

export const updateStoreSchema = createStoreSchema.partial();

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().max(1000).optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ─── Prisma-derived types ─────────────────────────────────────────────────────

const storeCardValidator = Prisma.validator<Prisma.StoreDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    category: true,
    images: true,
    location: true,
    hours: true,
    isVerified: true,
    status: true,
    collegeId: true,
    createdAt: true,
    owner: { select: { id: true, name: true, avatarUrl: true } },
    _count: { select: { reviews: { where: { isArchived: false } } } },
  },
});

const storeDetailValidator = Prisma.validator<Prisma.StoreDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    category: true,
    images: true,
    phone: true,
    whatsapp: true,
    location: true,
    mapUrl: true,
    hours: true,
    quickReplies: true,
    isVerified: true,
    status: true,
    ownerId: true,
    collegeId: true,
    createdAt: true,
    owner: {
      select: { id: true, name: true, avatarUrl: true, username: true },
    },
    reviews: {
      where: { isArchived: false },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        rating: true,
        body: true,
        createdAt: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    },
    _count: { select: { reviews: { where: { isArchived: false } } } },
  },
});

export type StoreCard = Prisma.StoreGetPayload<typeof storeCardValidator>;
export type StoreDetail = Prisma.StoreGetPayload<typeof storeDetailValidator>;

export type StoreReviewItem = StoreDetail["reviews"][number];

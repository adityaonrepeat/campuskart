import { z } from "zod";
import type { Prisma } from "@prisma/client";

// Zod schemas

export const createListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
  price: z
    .number()
    .positive("Price must be positive")
    .max(100_000, "Price cannot exceed ₹1,00,000"),
  category: z.enum([
    "BOOKS",
    "ELECTRONICS",
    "CLOTHING",
    "FURNITURE",
    "NOTES",
    "SPORTS",
    "OTHER",
  ]),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]),
  listingType: z.enum(["FIXED_PRICE", "NEGOTIABLE"]),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(5, "Maximum 5 images allowed"),
  imageKeys: z.array(z.string()).min(1).max(5),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;

// Prisma-derived types

const listingCardArgs = {
  select: {
    id: true,
    title: true,
    price: true,
    images: true,
    category: true,
    condition: true,
    status: true,
    listingType: true,
    createdAt: true,
    seller: { select: { id: true, name: true, avatarUrl: true } },
    college: { select: { name: true } },
  },
} satisfies Prisma.ListingDefaultArgs;

const listingDetailArgs = {
  include: {
    seller: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        username: true,
        college: { select: { name: true } },
      },
    },
  },
} satisfies Prisma.ListingDefaultArgs;

export type ListingCard = Prisma.ListingGetPayload<typeof listingCardArgs>;
export type ListingDetail = Prisma.ListingGetPayload<typeof listingDetailArgs>;

// Filter types

export interface ListingFilters {
  category?: string;
  search?: string;
  cursor?: string;
  limit?: number;
  storeId?: string; // when set, fetches listings for a specific store (bypasses main feed)
  condition?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: string; // "newest" | "price_asc" | "price_desc"
  tab?: string; // "all" | "bidding" | "buynow"
}

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { PaginatedResponse } from "@/types/api";
import type { ListingCard } from "@/types/listing";

export const LISTINGS_PAGE_SIZE = 20;

const VALID_CATEGORIES = new Set([
  "BOOKS",
  "ELECTRONICS",
  "CLOTHING",
  "FURNITURE",
  "NOTES",
  "SPORTS",
  "OTHER",
]);

const VALID_CONDITIONS = new Set(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]);

export interface ListingsQuery {
  collegeId: string;
  category?: string;
  search?: string;
  storeId?: string;
  cursor?: string;
  limit?: number;
  condition?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: string;
  tab?: string;
}

export async function queryListings(
  params: ListingsQuery
): Promise<PaginatedResponse<ListingCard>> {
  const {
    collegeId,
    category,
    search,
    storeId,
    cursor,
    condition,
    priceMin,
    priceMax,
    sort = "newest",
    tab = "all",
  } = params;

  const limit = Math.min(Math.max(1, params.limit || LISTINGS_PAGE_SIZE), 50);

  // Composite cursor: "<createdAt ISO>|<id>"; prevents items with the same
  // millisecond timestamp from being silently dropped across pages.
  const cursorParts = cursor?.split("|");
  const cursorDate = cursorParts?.[0];
  const cursorId = cursorParts?.[1];

  const andConditions: Prisma.ListingWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  // Cursor pagination only applies to newest sort
  if (sort === "newest" && cursorDate && cursorId) {
    andConditions.push({
      OR: [
        { createdAt: { lt: new Date(cursorDate) } },
        {
          createdAt: { equals: new Date(cursorDate) },
          id: { lt: cursorId },
        },
      ],
    });
  }

  if (priceMin !== undefined && !isNaN(priceMin)) {
    andConditions.push({ price: { gte: priceMin } });
  }
  if (priceMax !== undefined && !isNaN(priceMax)) {
    andConditions.push({ price: { lte: priceMax } });
  }

  const listingTypeFilter: Prisma.ListingWhereInput =
    tab === "bidding"
      ? { listingType: "NEGOTIABLE" }
      : tab === "buynow"
        ? { listingType: "FIXED_PRICE" }
        : {};

  // storeId present → fetch that store's listings; absent → main feed (no store listings)
  // collegeId is always enforced regardless of storeId to prevent cross-college data access
  const where: Prisma.ListingWhereInput = {
    collegeId,
    ...(storeId ? { storeId } : { storeId: null }),
    status: "ACTIVE",
    ...listingTypeFilter,
    ...(category && VALID_CATEGORIES.has(category)
      ? {
          category: category as
            | "BOOKS"
            | "ELECTRONICS"
            | "CLOTHING"
            | "FURNITURE"
            | "NOTES"
            | "SPORTS"
            | "OTHER",
        }
      : {}),
    ...(condition && VALID_CONDITIONS.has(condition)
      ? {
          condition: condition as "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR",
        }
      : {}),
    ...(andConditions.length > 0 ? { AND: andConditions } : {}),
  };

  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    sort === "price_asc"
      ? [{ price: "asc" }]
      : sort === "price_desc"
        ? [{ price: "desc" }]
        : [{ createdAt: "desc" }, { id: "desc" }];

  // For price sorts use a higher limit since we skip cursor pagination
  const effectiveLimit = sort === "newest" ? limit : 50;

  const listings = await db.listing.findMany({
    where,
    orderBy,
    take: effectiveLimit + 1,
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
  });

  const hasMore = listings.length > effectiveLimit;
  const items = hasMore ? listings.slice(0, effectiveLimit) : listings;
  const nextCursor =
    sort === "newest" && hasMore && items.length > 0
      ? `${items[items.length - 1].createdAt.toISOString()}|${items[items.length - 1].id}`
      : null;

  return { items, nextCursor, hasMore };
}

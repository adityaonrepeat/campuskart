import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { PaginatedResponse } from "@/types/api";
import type { ListingCard } from "@/types/listing";

const PAGE_SIZE = 20;

const VALID_CATEGORIES = new Set([
  "BOOKS",
  "ELECTRONICS",
  "CLOTHING",
  "FURNITURE",
  "NOTES",
  "SPORTS",
  "OTHER",
]);

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") ?? "", 10) || PAGE_SIZE),
    50
  );

  // Composite cursor: "<createdAt ISO>|<id>" — prevents items with the same
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

  if (cursorDate && cursorId) {
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

  const where: Prisma.ListingWhereInput = {
    collegeId: session.user.collegeId,
    status: "ACTIVE",
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
    ...(andConditions.length > 0 ? { AND: andConditions } : {}),
  };

  const listings = await db.listing.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: {
      id: true,
      title: true,
      price: true,
      images: true,
      category: true,
      condition: true,
      status: true,
      createdAt: true,
      seller: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const hasMore = listings.length > limit;
  const items = hasMore ? listings.slice(0, limit) : listings;
  const nextCursor =
    hasMore && items.length > 0
      ? `${items[items.length - 1].createdAt.toISOString()}|${items[items.length - 1].id}`
      : null;

  const response: PaginatedResponse<ListingCard> = {
    items: items as ListingCard[],
    nextCursor,
    hasMore,
  };

  return NextResponse.json({ success: true, data: response });
}

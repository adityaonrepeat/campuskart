import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { PaginatedResponse } from "@/types/api";
import type { StoreCard } from "@/types/store";

const PAGE_SIZE = 20;

const VALID_CATEGORIES = new Set([
  "FOOD_DRINKS",
  "STATIONERY",
  "CLOTHING",
  "ELECTRONICS",
  "SERVICES",
  "HEALTH_BEAUTY",
  "BOOKS",
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
  const tag = searchParams.get("tag") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") ?? "", 10) || PAGE_SIZE),
    50
  );

  const cursorParts = cursor?.split("|");
  const cursorDate = cursorParts?.[0];
  const cursorId = cursorParts?.[1];

  const andConditions: Prisma.StoreWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ],
    });
  }

  if (tag) {
    andConditions.push({ tags: { hasSome: [tag] } });
  }

  if (cursorDate && cursorId) {
    andConditions.push({
      OR: [
        { createdAt: { lt: new Date(cursorDate) } },
        { createdAt: { equals: new Date(cursorDate) }, id: { lt: cursorId } },
      ],
    });
  }

  const where: Prisma.StoreWhereInput = {
    collegeId: session.user.collegeId,
    status: "ACTIVE",
    ...(category && VALID_CATEGORIES.has(category)
      ? { category: category as Prisma.EnumStoreCategoryFilter }
      : {}),
    ...(andConditions.length > 0 ? { AND: andConditions } : {}),
  };

  const stores = await db.store.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      images: true,
      location: true,
      hours: true,
      tags: true,
      isVerified: true,
      status: true,
      collegeId: true,
      createdAt: true,
      owner: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { reviews: { where: { isArchived: false } } } },
    },
  });

  const hasMore = stores.length > limit;
  const items = hasMore ? stores.slice(0, limit) : stores;
  const nextCursor =
    hasMore && items.length > 0
      ? `${items[items.length - 1].createdAt.toISOString()}|${items[items.length - 1].id}`
      : null;

  const response: PaginatedResponse<StoreCard> = {
    items: items as StoreCard[],
    nextCursor,
    hasMore,
  };

  return NextResponse.json({ success: true, data: response });
}

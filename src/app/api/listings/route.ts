import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { queryListings } from "@/lib/listings";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  const limit = searchParams.get("limit");

  const data = await queryListings({
    collegeId: session.user.collegeId,
    category: searchParams.get("category") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    storeId: searchParams.get("storeId") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    condition: searchParams.get("condition") ?? undefined,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    sort: searchParams.get("sort") ?? undefined,
    tab: searchParams.get("tab") ?? undefined,
  });

  return NextResponse.json({ success: true, data });
}

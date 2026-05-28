import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const store = await db.store.findUnique({
    where: { id },
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

  if (!store) {
    return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
  }

  // Visitors can only see ACTIVE stores; owner and admin/mod can see any status
  const isOwner = store.ownerId === session.user.id;
  const isMod =
    (session.user.role as string) === "MODERATOR" ||
    (session.user.role as string) === "ADMIN";

  if (store.status !== "ACTIVE" && !isOwner && !isMod) {
    return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
  }

  // College-scope: visitors must be in the same college
  if (!isOwner && !isMod && store.collegeId !== session.user.collegeId) {
    return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: store });
}

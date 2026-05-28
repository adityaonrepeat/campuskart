import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ConversationDetail } from "@/types/chat";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const conv = await db.conversation.findUnique({
    where: { id },
    include: {
      listing: { select: { title: true, images: true, status: true, price: true } },
      participants: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, username: true } },
        },
      },
    },
  });

  if (!conv) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const isParticipant = conv.participants.some((p) => p.userId === session.user.id);
  if (!isParticipant) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const other = conv.participants.find((p) => p.userId !== session.user.id);

  const data: ConversationDetail = {
    id: conv.id,
    listingId: conv.listingId,
    listingTitle: conv.listing?.title ?? null,
    listingImage: conv.listing?.images[0] ?? null,
    listingStatus: conv.listing?.status ?? null,
    listingPrice: conv.listing?.price ?? null,
    otherParticipant: {
      userId: other?.user.id ?? "",
      name: other?.user.name ?? "Unknown",
      avatarUrl: other?.user.avatarUrl ?? null,
      username: other?.user.username ?? "",
    },
  };

  return NextResponse.json({ success: true, data });
}

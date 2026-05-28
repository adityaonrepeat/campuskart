import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversationCreateRatelimit } from "@/lib/rate-limit";
import type { ConversationListItem } from "@/types/chat";

export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const participantRows = await db.conversationParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      conversation: {
        include: {
          listing: { select: { title: true, images: true, status: true } },
          participants: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true, username: true } },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, createdAt: true },
          },
        },
      },
    },
    orderBy: { conversation: { lastMessageAt: "desc" } },
  });

  // "Delete for me": drop conversations the user hid, unless a newer message has
  // arrived since they hid it (in which case it re-appears).
  const visibleRows = participantRows.filter((p) => {
    if (!p.hiddenAt) return true;
    const last = p.conversation.lastMessageAt;
    return last !== null && last > p.hiddenAt;
  });

  const unreadCounts = await Promise.all(
    visibleRows.map(async (p) => {
      const count = await db.message.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: session.user.id },
          ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}),
        },
      });
      return { conversationId: p.conversationId, count };
    })
  );
  const unreadMap = new Map(unreadCounts.map((r) => [r.conversationId, r.count]));

  const data: ConversationListItem[] = visibleRows.map((p) => {
    const conv = p.conversation;
    const other = conv.participants.find((cp) => cp.userId !== session.user.id);
    return {
      id: conv.id,
      listingId: conv.listingId,
      listingTitle: conv.listing?.title ?? null,
      listingImage: conv.listing?.images[0] ?? null,
      listingStatus: conv.listing?.status ?? null,
      otherParticipant: {
        userId: other?.user.id ?? "",
        name: other?.user.name ?? "Unknown",
        avatarUrl: other?.user.avatarUrl ?? null,
        username: other?.user.username ?? "",
      },
      lastMessage: conv.messages[0]?.content ?? null,
      lastMessageAt: conv.messages[0]?.createdAt.toISOString() ?? null,
      unreadCount: unreadMap.get(conv.id) ?? 0,
    };
  });

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { success: rateLimitOk } = await conversationCreateRatelimit.limit(session.user.id);
  if (!rateLimitOk) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const record =
    body !== null && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const listingId = "listingId" in record ? String(record.listingId) : undefined;
  const message = typeof record.message === "string" ? record.message.trim() : undefined;

  if (!listingId) {
    return NextResponse.json(
      { success: false, error: "listingId is required" },
      { status: 400 }
    );
  }

  if (message && message.length > 500) {
    return NextResponse.json(
      { success: false, error: "Message cannot exceed 500 characters." },
      { status: 400 }
    );
  }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, status: true, sellerId: true, collegeId: true },
  });

  if (!listing) {
    return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
  }

  if (listing.status !== "ACTIVE") {
    return NextResponse.json(
      {
        success: false,
        error: "This listing is no longer active.",
        code: "LISTING_NOT_ACTIVE",
      },
      { status: 409 }
    );
  }

  if (listing.sellerId === session.user.id) {
    return NextResponse.json(
      { success: false, error: "Cannot start a conversation with yourself." },
      { status: 400 }
    );
  }

  // Find-or-create the buyer↔seller conversation for this listing (dedupe).
  const existing = await db.conversation.findFirst({
    where: {
      listingId,
      participants: { some: { userId: session.user.id } },
    },
    select: { id: true },
  });

  const isNew = !existing;
  const conversationId =
    existing?.id ??
    (
      await db.conversation.create({
        data: {
          listingId,
          collegeId: listing.collegeId,
          participants: {
            create: [{ userId: session.user.id }, { userId: listing.sellerId }],
          },
        },
        select: { id: true },
      })
    ).id;

  // Post the buyer's first message (if they wrote one) so it shows for both sides.
  if (message) {
    await db.message.create({
      data: { conversationId, senderId: session.user.id, content: message },
    });
    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
  }

  return NextResponse.json(
    { success: true, data: { conversationId } },
    { status: isNew ? 201 : 200 }
  );
}

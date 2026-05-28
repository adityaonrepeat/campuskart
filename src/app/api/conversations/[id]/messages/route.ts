import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { PaginatedResponse } from "@/types/api";
import type { Message } from "@/types/chat";

const PAGE_SIZE = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
  });
  if (!participant) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;

  const messages = await db.message.findMany({
    where: { conversationId },
    include: { sender: { select: { name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = messages.length > PAGE_SIZE;
  const items = messages.slice(0, PAGE_SIZE);
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  const data: PaginatedResponse<Message> = {
    items: items.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.sender.name,
      senderAvatar: m.sender.avatarUrl,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
    nextCursor,
    hasMore,
  };

  return NextResponse.json({ success: true, data });
}

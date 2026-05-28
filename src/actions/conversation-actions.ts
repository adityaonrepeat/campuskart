"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types/api";

/**
 * Hide a conversation from the current user's chat list ("delete for me").
 * Only the caller's participant row is flagged — the other person keeps theirs.
 * A hidden conversation re-appears automatically when a newer message arrives
 * (see the visibility filter in GET /api/conversations).
 */
export async function hideConversation(
  conversationId: string
): Promise<ApiResponse<{ id: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Unauthorized" };

  const participant = await db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
    select: { id: true },
  });
  if (!participant) return { success: false, error: "Conversation not found" };

  await db.conversationParticipant.update({
    where: { id: participant.id },
    data: { hiddenAt: new Date() },
  });

  revalidatePath("/chat");
  return { success: true, data: { id: conversationId } };
}

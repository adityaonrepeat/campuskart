import type { Server, Socket } from "socket.io";
import { db } from "./db";
import { checkMessageRateLimit } from "./rate-limiter";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SendMessagePayload,
  SocketData,
} from "./types";

type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;
type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

// In-memory presence — no DB column for isOnline
// collegeId → Set<userId>
const onlineUsers = new Map<string, Set<string>>();
// userId → active socket count (handles multiple tabs)
const socketCount = new Map<string, number>();

function getCollegePresence(collegeId: string): Set<string> {
  let set = onlineUsers.get(collegeId);
  if (!set) {
    set = new Set();
    onlineUsers.set(collegeId, set);
  }
  return set;
}

export function registerSocketHandlers(io: AppServer, socket: AppSocket): void {
  const { userId, collegeId } = socket.data;

  // Track connection count for multi-tab support
  const prevCount = socketCount.get(userId) ?? 0;
  socketCount.set(userId, prevCount + 1);

  // Add to college presence and join the college room
  const presence = getCollegePresence(collegeId);
  const wasAlreadyOnline = presence.has(userId);
  presence.add(userId);
  void socket.join(`college:${collegeId}:presence`);

  // Only broadcast "online" on first connection for this user
  if (!wasAlreadyOnline) {
    socket
      .to(`college:${collegeId}:presence`)
      .emit("server:user_online", userId);
  }

  // ── client:join_conversation ──────────────────────────────────────────────
  socket.on("client:join_conversation", async (conversationId, callback) => {
    try {
      const participant = await db.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
        select: { id: true },
      });

      if (!participant) {
        callback({ success: false, error: "Not a participant" });
        return;
      }

      await socket.join(`conversation:${conversationId}`);

      // Snapshot of currently online users in this college
      const onlineInCollege = Array.from(getCollegePresence(collegeId));
      socket.emit("server:presence_snapshot", onlineInCollege);

      callback({ success: true });
    } catch {
      callback({ success: false, error: "Failed to join conversation" });
    }
  });

  // ── client:leave_conversation ─────────────────────────────────────────────
  socket.on("client:leave_conversation", (conversationId) => {
    void socket.leave(`conversation:${conversationId}`);
  });

  // ── client:send_message ───────────────────────────────────────────────────
  socket.on(
    "client:send_message",
    async (payload: SendMessagePayload, callback) => {
      const { conversationId, content } = payload;

      // Trim and reject empty messages
      const trimmed = content.trim();
      if (!trimmed) {
        callback({ success: false, error: "Message cannot be empty" });
        return;
      }

      try {
        // Rate limit check
        const allowed = await checkMessageRateLimit(userId);
        if (!allowed) {
          callback({ success: false, error: "Rate limit exceeded" });
          return;
        }

        // Verify participant membership
        const participant = await db.conversationParticipant.findUnique({
          where: { conversationId_userId: { conversationId, userId } },
          select: { id: true },
        });

        if (!participant) {
          callback({ success: false, error: "Not a participant" });
          return;
        }

        // Persist message and bump lastMessageAt atomically
        const message = await db.$transaction(async (tx) => {
          const msg = await tx.message.create({
            data: { conversationId, senderId: userId, content: trimmed },
            include: {
              sender: { select: { id: true, name: true, avatarUrl: true } },
            },
          });

          await tx.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
          });

          return msg;
        });

        const messageWithSender = {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          senderName: message.sender.name,
          senderAvatar: message.sender.avatarUrl ?? null,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
        };

        // Deliver to all room members (including sender — they replace the optimistic copy)
        io.to(`conversation:${conversationId}`).emit(
          "server:message_received",
          messageWithSender
        );

        callback({ success: true });
      } catch {
        callback({ success: false, error: "Failed to send message" });
      }
    }
  );

  // ── client:typing_start ───────────────────────────────────────────────────
  socket.on("client:typing_start", (conversationId) => {
    if (!socket.rooms.has(`conversation:${conversationId}`)) return;
    socket
      .to(`conversation:${conversationId}`)
      .emit("server:typing", { conversationId, userId, isTyping: true });
  });

  // ── client:typing_stop ────────────────────────────────────────────────────
  socket.on("client:typing_stop", (conversationId) => {
    if (!socket.rooms.has(`conversation:${conversationId}`)) return;
    socket
      .to(`conversation:${conversationId}`)
      .emit("server:typing", { conversationId, userId, isTyping: false });
  });

  // ── client:mark_read ──────────────────────────────────────────────────────
  socket.on("client:mark_read", async (conversationId) => {
    try {
      await db.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId } },
        data: { lastReadAt: new Date() },
      });
    } catch {
      // Best-effort — no ack, non-critical
    }
  });

  // ── disconnect ────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const remaining = (socketCount.get(userId) ?? 1) - 1;

    if (remaining <= 0) {
      socketCount.delete(userId);

      // Remove from in-memory presence
      const collegePresence = onlineUsers.get(collegeId);
      if (collegePresence) {
        collegePresence.delete(userId);
        if (collegePresence.size === 0) {
          onlineUsers.delete(collegeId);
        }
      }

      // Notify college that this user is offline
      io.to(`college:${collegeId}:presence`).emit("server:user_offline", userId);

      // Write lastSeen once per session — fire and forget
      db.user
        .update({ where: { id: userId }, data: { lastSeen: new Date() } })
        .catch(() => {
          // Non-critical
        });
    } else {
      socketCount.set(userId, remaining);
    }
  });
}

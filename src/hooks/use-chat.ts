"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useSocketStore } from "@/stores/socket-store";
import type { MessageWithSender } from "@/types/socket";
import type { Message, PaginatedMessages } from "@/types/chat";

const TYPING_DEBOUNCE_MS = 1500;

export function useChat(conversationId: string) {
  const socket = useSocketStore((s) => s.socket);
  const queryClient = useQueryClient();
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Join room on mount (if already connected) and re-join on every reconnect.
  // Both cases are handled in one effect to eliminate the race where the
  // connect event fires between the two separate effects.
  useEffect(() => {
    if (!socket) return;

    if (socket.connected) {
      socket.emit("client:join_conversation", conversationId, (_ack) => {});
      socket.emit("client:mark_read", conversationId);
    }

    const onConnect = () => {
      socket.emit("client:join_conversation", conversationId, (_ack) => {});
      socket.emit("client:mark_read", conversationId);
    };
    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
      socket.emit("client:leave_conversation", conversationId);
    };
  }, [socket, conversationId]);

  // Merge incoming messages into React Query cache
  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg: MessageWithSender) => {
      if (msg.conversationId !== conversationId) return;
      const newMsg: Message = {
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar,
        content: msg.content,
        createdAt: msg.createdAt,
      };
      queryClient.setQueryData(
        ["messages", conversationId],
        (old: InfiniteData<PaginatedMessages> | undefined) => {
          if (!old) return old;
          // Avoid duplicates (optimistic insert may have added it already)
          const exists = old.pages[0]?.items.some((m) => m.id === newMsg.id);
          if (exists) return old;
          return {
            ...old,
            pages: old.pages.map((page, i) =>
              i === 0 ? { ...page, items: [newMsg, ...page.items] } : page
            ),
          };
        }
      );
      socket.emit("client:mark_read", conversationId);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("server:message_received", handleMessage);
    return () => { socket.off("server:message_received", handleMessage); };
  }, [socket, conversationId, queryClient]);

  const sendMessage = useCallback(
    (content: string): Promise<boolean> =>
      new Promise((resolve) => {
        if (!socket || !socket.connected) { resolve(false); return; }
        socket.timeout(10000).emit("client:send_message", { conversationId, content }, (err, ack) =>
          resolve(!err && Boolean(ack?.success))
        );
      }),
    [socket, conversationId]
  );

  const notifyTyping = useCallback(() => {
    if (!socket) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("client:typing_start", conversationId);
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket?.emit("client:typing_stop", conversationId);
    }, TYPING_DEBOUNCE_MS);
  }, [socket, conversationId]);

  return { sendMessage, notifyTyping };
}

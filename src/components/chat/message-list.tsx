"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { Button } from "@/components/ui/button";
import type { PaginatedResponse } from "@/types/api";
import type { Message } from "@/types/chat";

interface MessageListProps {
  conversationId: string;
  currentUserId: string;
}

async function fetchMessages(
  conversationId: string,
  cursor?: string
): Promise<PaginatedResponse<Message>> {
  const url = `/api/conversations/${conversationId}/messages${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load messages");
  const json = (await res.json()) as { success: true; data: PaginatedResponse<Message> };
  return json.data;
}

export function MessageList({ conversationId, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      fetchMessages(conversationId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 0,
  });

  // Scroll to bottom when newest message changes
  const newestId = data?.pages[0]?.items[0]?.id;
  useEffect(() => {
    if (!newestId) return;
    bottomRef.current?.scrollIntoView({
      behavior: isFirstLoad.current ? "instant" : "smooth",
    });
    isFirstLoad.current = false;
  }, [newestId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        Loading messages…
      </div>
    );
  }

  // Pages are newest-first; reverse to get oldest-first for display
  const allMessages = [...(data?.pages.flatMap((p) => p.items) ?? [])].reverse();

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-5 min-h-0">
      {hasNextPage && (
        <div className="flex justify-center pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-xs text-muted-foreground h-7"
          >
            {isFetchingNextPage ? "Loading…" : "Load older messages"}
          </Button>
        </div>
      )}
      {!hasNextPage && allMessages.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground py-2">
          Beginning of conversation
        </p>
      )}
      {allMessages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
        </div>
      )}
      {allMessages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.senderId === currentUserId}
        />
      ))}
      <TypingIndicator conversationId={conversationId} currentUserId={currentUserId} />
      <div ref={bottomRef} />
    </div>
  );
}

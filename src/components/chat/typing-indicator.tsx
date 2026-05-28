"use client";

import { useSocketStore } from "@/stores/socket-store";

// Stable reference so the zustand selector doesn't return a fresh [] each render
// (useSyncExternalStore requires a cached snapshot — a new [] triggers an infinite loop).
const EMPTY_TYPING: string[] = [];

interface TypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
}

export function TypingIndicator({ conversationId, currentUserId }: TypingIndicatorProps) {
  const typingUsers = useSocketStore((s) => s.typingUsers[conversationId] ?? EMPTY_TYPING);
  const othersTyping = typingUsers.filter((id) => id !== currentUserId);

  if (othersTyping.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-1 py-1 text-xs text-muted-foreground">
      <span className="flex gap-0.5 items-end h-4">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
      </span>
      <span>typing…</span>
    </div>
  );
}

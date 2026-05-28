"use client";

import { cn } from "@/lib/utils";
import { useSocketStore } from "@/stores/socket-store";

interface OnlineBadgeProps {
  userId: string;
  className?: string;
}

export function OnlineBadge({ userId, className }: OnlineBadgeProps) {
  const isOnline = useSocketStore((s) => s.onlineUsers.has(userId));
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full border-2 border-background",
        isOnline ? "bg-green-500" : "bg-muted-foreground/30",
        className
      )}
    />
  );
}

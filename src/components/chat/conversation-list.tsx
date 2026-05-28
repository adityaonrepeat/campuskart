"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { ConversationItem } from "./conversation-item";
import type { ConversationListItem } from "@/types/chat";
import type { ApiResponse } from "@/types/api";

interface ConversationListProps {
  activeConversationId?: string;
}

async function fetchConversations(): Promise<ConversationListItem[]> {
  const res = await fetch("/api/conversations");
  if (!res.ok) throw new Error("Failed to load conversations");
  const json = (await res.json()) as ApiResponse<ConversationListItem[]>;
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function ConversationList({ activeConversationId }: ConversationListProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
            <div className="h-11 w-11 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Failed to load conversations.
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <MessageSquare className="h-10 w-10 opacity-30" />
        <p className="text-sm font-medium">No conversations yet</p>
        <p className="text-xs text-center text-muted-foreground/70">
          Contact a seller to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {data.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeConversationId}
        />
      ))}
    </div>
  );
}

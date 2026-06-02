"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { ConversationItem } from "./conversation-item";
import type { ConversationListItem } from "@/types/chat";
import type { ApiResponse } from "@/types/api";

async function fetchConversations(): Promise<ConversationListItem[]> {
  const res = await fetch("/api/conversations");
  if (!res.ok) throw new Error("Failed to load conversations");
  const json = (await res.json()) as ApiResponse<ConversationListItem[]>;
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function ConversationList() {
  const pathname = usePathname();
  const activeConversationId = pathname.startsWith("/chat/")
    ? pathname.replace("/chat/", "")
    : undefined;
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 0,
  });

  const filtered = data?.filter(
    (c) =>
      !search.trim() ||
      c.otherParticipant.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.listingTitle?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search bar only */}
      <div className="p-3 border-b border-border shrink-0">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="h-11 w-11 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Failed to load conversations.
          </div>
        )}

        {!isLoading && !isError && !filtered?.length && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <MessageSquare className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">
              {search ? "No results found" : "No conversations yet"}
            </p>
            <p className="text-xs text-center text-muted-foreground/70">
              {search ? "Try a different search" : "Contact a seller to start chatting"}
            </p>
          </div>
        )}

        {filtered?.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversationId}
          />
        ))}
      </div>
    </div>
  );
}

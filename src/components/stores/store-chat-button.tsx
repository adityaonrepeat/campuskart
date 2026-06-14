"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";

interface StoreChatButtonProps {
  storeId: string;
  existingConversationId: string | null;
  label?: string;
  className?: string;
}

export function StoreChatButton({
  storeId,
  existingConversationId,
  label = "Chat with store",
  className,
}: StoreChatButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  async function startChat() {
    // Already chatting with this store; just open the existing thread.
    if (existingConversationId) {
      router.push(`/chat/${existingConversationId}`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      const json = (await res.json()) as ApiResponse<{ conversationId: string }>;

      if (json.success) {
        await queryClient.invalidateQueries({ queryKey: ["conversations"] });
        router.push(`/chat/${json.data.conversationId}`);
        return;
      }

      if (json.code === "STORE_NOT_ACTIVE") {
        toast.error("This store is no longer available.");
        router.refresh();
      } else {
        toast.error(json.error ?? "Failed to open chat.");
      }
    } catch {
      toast.error("Failed to open chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={startChat}
      disabled={isLoading}
      className={cn(
        "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm btn-shimmer transition-all duration-200 hover:shadow-accent-lg disabled:opacity-60",
        className
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      {isLoading ? "Opening…" : label}
    </button>
  );
}

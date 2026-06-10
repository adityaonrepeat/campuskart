"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { cn, formatTimeAgo, getInitials } from "@/lib/utils";
import { hideConversation } from "@/actions/conversation-actions";
import { OnlineBadge } from "./online-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ConversationListItem } from "@/types/chat";

interface ConversationItemProps {
  conversation: ConversationListItem;
  isActive?: boolean;
}

export function ConversationItem({ conversation, isActive }: ConversationItemProps) {
  const { otherParticipant, lastMessage, lastMessageAt, unreadCount } = conversation;
  const hasUnread = unreadCount > 0;

  // Customers see the store's identity; the owner (storeName comes back null) sees
  // each customer as a person, so their chats stay distinguishable.
  const isStore = Boolean(conversation.storeName);
  const displayName = conversation.storeName ?? otherParticipant.name;
  const displayImage = conversation.storeImage ?? otherParticipant.avatarUrl;

  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    setIsDeleting(true);
    const res = await hideConversation(conversation.id);
    setIsDeleting(false);
    setConfirmOpen(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Conversation deleted.");
    await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    if (isActive) router.push("/chat");
  }

  return (
    <>
      <div
        className={cn(
          "relative group flex items-start gap-3 px-4 py-4 hover:bg-surface transition-colors border-b border-border/50",
          isActive && "bg-accent-muted"
        )}
      >
        {/* Active Indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent" />
        )}
        <Link href={`/chat/${conversation.id}`} className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar — rounded square with online dot */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-accent-muted">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={displayName}
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-accent">
                  {getInitials(displayName)}
                </div>
              )}
            </div>
            <OnlineBadge
              userId={otherParticipant.userId}
              className="absolute -bottom-0.5 -right-0.5 border-2 border-white"
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-sm font-semibold text-foreground truncate">
                {displayName}
              </span>
              {lastMessageAt && (
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatTimeAgo(lastMessageAt)}
                </span>
              )}
            </div>
            <p className={cn("text-xs truncate mb-1", hasUnread ? "text-foreground" : "text-muted-foreground")}>
              {lastMessage ?? "Start chatting"}
            </p>
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                  isStore ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"
                )}
              >
                {isStore ? "🏪 Store" : "👤 Seller"}
              </span>
              {hasUnread && (
                <span className="w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Delete — appears on hover */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
          disabled={isDeleting}
          aria-label="Delete conversation"
          className="opacity-0 group-hover:opacity-100 shrink-0 self-center text-muted-foreground/40 hover:text-destructive transition-all disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete conversation?</DialogTitle>
            <DialogDescription>
              This is removed from your chat list only. The other person keeps their copy, and it
              comes back if they message you again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { cn, formatTimeAgo } from "@/lib/utils";
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
  const { otherParticipant, lastMessage, lastMessageAt, unreadCount, listingTitle } =
    conversation;
  const hasUnread = unreadCount > 0;

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
    <div
      className={cn(
        "relative flex items-stretch transition-colors hover:bg-accent",
        isActive && "bg-accent"
      )}
    >
      <Link
        href={`/chat/${conversation.id}`}
        className="flex flex-1 min-w-0 items-center gap-3 px-4 py-3"
      >
        <div className="relative shrink-0">
          <div className="h-11 w-11 rounded-full bg-muted overflow-hidden">
            {otherParticipant.avatarUrl ? (
              <Image
                src={otherParticipant.avatarUrl}
                alt={otherParticipant.name}
                width={44}
                height={44}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-muted-foreground uppercase">
                {otherParticipant.name.charAt(0)}
              </div>
            )}
          </div>
          <OnlineBadge
            userId={otherParticipant.userId}
            className="absolute bottom-0 right-0"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-sm truncate",
                hasUnread ? "font-semibold" : "font-medium"
              )}
            >
              {otherParticipant.name}
            </span>
            {lastMessageAt && (
              <span className="text-[10px] text-muted-foreground shrink-0">
                {formatTimeAgo(lastMessageAt)}
              </span>
            )}
          </div>
          {listingTitle && (
            <p className="text-[11px] text-muted-foreground/80 truncate">{listingTitle}</p>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <p
              className={cn(
                "text-xs truncate flex-1",
                hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {lastMessage ?? "Start chatting"}
            </p>
            {hasUnread && (
              <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-semibold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={isDeleting}
        aria-label="Delete conversation"
        className="shrink-0 flex items-center px-3 text-muted-foreground/50 transition-colors hover:text-destructive disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete conversation?</DialogTitle>
            <DialogDescription>
              This is removed from your chat list only. The other person keeps
              their copy, and it comes back if they message you again.
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
    </div>
  );
}

import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className={cn("flex items-end gap-2", isOwn ? "justify-end" : "justify-start")}>
      {/* Avatar for received messages */}
      {!isOwn && (
        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mb-1 bg-accent-muted">
          {message.senderAvatar ? (
            <Image
              src={message.senderAvatar}
              alt={message.senderName}
              width={28}
              height={28}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] font-semibold text-accent">
              {getInitials(message.senderName)}
            </div>
          )}
        </div>
      )}
      <div
        className={cn(
          "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
          isOwn
            ? "bg-accent text-white rounded-br-sm"
            : "bg-surface text-foreground rounded-bl-sm border border-border"
        )}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isOwn ? "text-white/60 text-right" : "text-muted-foreground"
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

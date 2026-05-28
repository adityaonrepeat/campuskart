import { cn } from "@/lib/utils";
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
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        )}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        <p
          className={cn(
            "mt-0.5 text-[10px] text-right",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

"use client";

import { useChat } from "@/hooks/use-chat";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";

interface ChatThreadProps {
  conversationId: string;
  currentUserId: string;
  otherName?: string;
}

export function ChatThread({ conversationId, currentUserId, otherName }: ChatThreadProps) {
  const { sendMessage, notifyTyping } = useChat(conversationId);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <MessageList conversationId={conversationId} currentUserId={currentUserId} />
      <ChatInput
        onSend={sendMessage}
        onTyping={notifyTyping}
        placeholder={otherName ? `Message ${otherName}...` : "Type a message..."}
      />
    </div>
  );
}

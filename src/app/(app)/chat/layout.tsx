import type { ReactNode } from "react";
import { ChatLayoutShell } from "@/components/chat/chat-layout-shell";
import { ConversationList } from "@/components/chat/conversation-list";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface">
      <div className="mx-auto w-full max-w-400 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="mb-3">
          <h1 className="font-display text-xl font-semibold text-primary">Messages</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Chat with sellers on your campus</p>
        </div>
        <ChatLayoutShell sidebar={<ConversationList />}>
          {children}
        </ChatLayoutShell>
      </div>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface ChatLayoutShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function ChatLayoutShell({ sidebar, children }: ChatLayoutShellProps) {
  const pathname = usePathname();
  const hasThread = pathname.startsWith("/chat/");

  return (
    <div
      className={`chat-shell bg-white overflow-hidden flex${hasThread ? " chat-thread-mobile-fullscreen" : ""}`}
    >
      {/* Sidebar — full width when no thread; hidden on mobile when thread is open */}
      <div className={hasThread ? "chat-sidebar thread-open" : "chat-sidebar"}>
        {sidebar}
      </div>

      {/* Content — visible on desktop always; mobile only when thread is open */}
      <div className={hasThread ? "chat-content thread-open" : "chat-content"}>
        {children}
      </div>
    </div>
  );
}

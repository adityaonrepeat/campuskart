import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import { ChatLayoutShell } from "@/components/chat/chat-layout-shell";
import { ConversationList } from "@/components/chat/conversation-list";
import { canModerate } from "@/lib/permissions";

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const showAdmin = canModerate(session.user);

  return (
    <div className="flex flex-col overflow-hidden pb-12.75" style={{ height: "100dvh" }}>
      <AppHeader
        user={{ name: session.user.name ?? "User", avatarUrl: session.user.avatarUrl }}
        forceScrolled
        showAdmin={showAdmin}
        inFlow
      />
      <ChatLayoutShell sidebar={<ConversationList />}>
        {children}
      </ChatLayoutShell>
    </div>
  );
}

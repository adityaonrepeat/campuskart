import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ConversationList } from "@/components/chat/conversation-list";

export default async function ChatPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="py-4">
      <h1 className="text-xl font-semibold px-0 mb-1">Messages</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Your conversations with buyers and sellers.
      </p>
      <div className="-mx-4 border-t">
        <ConversationList />
      </div>
    </div>
  );
}

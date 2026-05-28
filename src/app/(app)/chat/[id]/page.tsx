import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatThread } from "@/components/chat/chat-thread";
import { OnlineBadge } from "@/components/chat/online-badge";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [session, { id }] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    params,
  ]);
  if (!session) redirect("/login");

  const conv = await db.conversation.findUnique({
    where: { id },
    include: {
      listing: { select: { title: true, status: true } },
      participants: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, username: true } },
        },
      },
    },
  });

  if (!conv) notFound();

  const isParticipant = conv.participants.some((p) => p.userId === session.user.id);
  if (!isParticipant) redirect("/chat");

  const other = conv.participants.find((p) => p.userId !== session.user.id);
  if (!other) notFound();

  return (
    <div className="-mx-4 flex flex-col" style={{ height: "calc(100dvh - 80px)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
        <Link
          href="/chat"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="relative shrink-0">
          <div className="h-9 w-9 rounded-full bg-muted overflow-hidden">
            {other.user.avatarUrl ? (
              <Image
                src={other.user.avatarUrl}
                alt={other.user.name}
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-muted-foreground uppercase">
                {other.user.name.charAt(0)}
              </div>
            )}
          </div>
          <OnlineBadge
            userId={other.user.id}
            className="absolute bottom-0 right-0"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{other.user.name}</p>
          {conv.listing && (
            <p className="text-xs text-muted-foreground truncate">
              About: {conv.listing.title}
              {conv.listing.status !== "ACTIVE" && (
                <span className="ml-1 text-destructive">
                  ({conv.listing.status.toLowerCase()})
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Thread */}
      <ChatThread conversationId={id} currentUserId={session.user.id} />
    </div>
  );
}

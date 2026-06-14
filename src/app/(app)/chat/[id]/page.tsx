import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getInitials } from "@/lib/utils";
import { ChatThread } from "@/components/chat/chat-thread";
import { OnlineBadge, OnlineStatusText } from "@/components/chat/online-badge";

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
      listing: { select: { id: true, title: true, status: true, images: true } },
      store: { select: { id: true, name: true, images: true, ownerId: true } },
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

  // A conversation is anchored to either a store or a listing.
  // For store chats, customers see the store as the peer; the owner sees the actual
  // customer (so their threads stay distinct). For listings, the peer is the other
  // person and we show a "Re:" item chip to clarify which item is being discussed.
  const showAsStore = Boolean(conv.store) && conv.store?.ownerId !== session.user.id;
  const peerName = showAsStore ? conv.store!.name : other.user.name;
  const peerImage = showAsStore ? (conv.store!.images?.[0] ?? null) : other.user.avatarUrl;

  const itemChip = !conv.store && conv.listing
    ? {
        label: conv.listing.title,
        image: conv.listing.images?.[0] ?? null,
        status: conv.listing.status !== "ACTIVE" ? conv.listing.status.toLowerCase() : null,
      }
    : null;

  const viewLink = conv.store
    ? { href: `/stores/${conv.store.id}`, action: "View Store" }
    : conv.listing
      ? { href: `/listings/${conv.listing.id}`, action: "View Listing" }
      : null;

  return (
    <>
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 h-[72px] border-b border-border shrink-0">
        {/* Back: mobile only */}
        <Link
          href="/chat"
          className="sm:hidden text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-accent-muted">
            {peerImage ? (
              <Image
                src={peerImage}
                alt={peerName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-accent">
                {getInitials(peerName)}
              </div>
            )}
          </div>
          <OnlineBadge
            userId={other.user.id}
            className="absolute -bottom-0.5 -right-0.5 border-2 border-white"
          />
        </div>

        {/* Name + online status */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{peerName}</p>
          <OnlineStatusText userId={other.user.id} />
        </div>

        {/* "Re:" item chip: listings only, so the user knows which item is being discussed */}
        {itemChip && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border shrink-0">
            {itemChip.image && (
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <Image
                  src={itemChip.image}
                  alt={itemChip.label}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Re:</p>
              <p className="text-xs font-semibold text-foreground truncate max-w-32">
                {itemChip.label}
                {itemChip.status && (
                  <span className="ml-1 font-normal text-destructive">({itemChip.status})</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* View Store / View Listing link: desktop only */}
        {viewLink && (
          <Link
            href={viewLink.href}
            className="hidden sm:block text-xs font-semibold text-accent hover:underline shrink-0"
          >
            {viewLink.action}
          </Link>
        )}
      </div>

      {/* Thread body */}
      <ChatThread
        conversationId={id}
        currentUserId={session.user.id}
        otherName={peerName}
      />
    </>
  );
}

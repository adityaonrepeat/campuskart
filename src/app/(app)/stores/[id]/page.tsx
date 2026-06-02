import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StoreTabs } from "@/components/stores/store-tabs";
import { STORE_CATEGORY_LABELS } from "@/types/store";
import type { Role } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StoreDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const store = await db.store.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      images: true,
      phone: true,
      whatsapp: true,
      location: true,
      mapUrl: true,
      hours: true,
      quickReplies: true,
      isVerified: true,
      status: true,
      ownerId: true,
      collegeId: true,
      createdAt: true,
      owner: { select: { id: true, name: true, avatarUrl: true, username: true } },
      reviews: {
        where: { isArchived: false },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          body: true,
          createdAt: true,
          userId: true,
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!store) notFound();

  const role = (session.user.role ?? "USER") as Role;
  const isOwner = store.ownerId === session.user.id;
  const isMod = role === "MODERATOR" || role === "ADMIN";

  if (store.status !== "ACTIVE" && !isOwner && !isMod) notFound();
  if (!isOwner && !isMod && store.collegeId !== session.user.collegeId) notFound();

  const myReview = store.reviews.find((r) => r.userId === session.user.id);
  const canReview = !isOwner && store.status === "ACTIVE";
  const categoryLabel = STORE_CATEGORY_LABELS[store.category] ?? store.category;
  const isActive = store.status === "ACTIVE";

  const avg =
    store.reviews.length > 0
      ? store.reviews.reduce((sum, r) => sum + r.rating, 0) / store.reviews.length
      : 0;

  const existingConversation = await db.conversation.findFirst({
    where: {
      storeId: store.id,
      participants: { some: { userId: session.user.id } },
    },
    select: { id: true },
  });
  const chatHref = existingConversation
    ? `/chat/${existingConversation.id}`
    : `/chat?storeId=${store.id}`;

  // Strip userId from reviews before passing to client component
  const reviewsForClient = store.reviews.map(({ userId: _uid, ...r }) => r);

  return (
    <div>
      {/* Status banner (owner/mod only) */}
      {store.status !== "ACTIVE" && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-800 text-center">
          {store.status === "PENDING"
            ? "⏳ Pending moderator verification — not yet visible to students."
            : "🗄 This store has been archived."}
        </div>
      )}

      {/* Cover image */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        {store.images[0] ? (
          <Image
            src={store.images[0]}
            alt={store.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
            <span className="text-8xl opacity-30">🏪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <div className="max-w-7xl mx-auto flex items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {isActive ? "OPEN" : "CLOSED"}
                </span>
                {store.isVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                    <CheckCircle2 className="h-3 w-3" />
                    VERIFIED
                  </span>
                )}
                {store.hours && (
                  <span className="text-white/70 text-xs">{store.hours}</span>
                )}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">
                {store.name}
              </h1>
              <p className="text-white/70 text-sm mt-0.5">{categoryLabel}</p>
            </div>

            {/* Edit button (owner, desktop) */}
            {isOwner && (
              <Link
                href={`/stores/${store.id}/edit`}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold hover:bg-white/30 transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit store
              </Link>
            )}

            {/* Chat button (desktop, non-owner) */}
            {!isOwner && isActive && (
              <Link
                href={chatHref}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold hover:bg-white/30 transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Chat with store
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Store info bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={s <= Math.round(avg) ? "#F59E0B" : "#D1D5DB"}
                    stroke="none"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </span>
              {avg > 0 && (
                <span className="text-sm font-semibold text-foreground">{avg.toFixed(1)}</span>
              )}
              <span className="text-xs text-muted-foreground">
                ({store.reviews.length} {store.reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* Location */}
            {store.location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {store.location}
              </div>
            )}

            {/* Hours */}
            {store.hours && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {store.hours}
              </div>
            )}

            {/* Mobile: edit / chat */}
            <div className="flex gap-2 ml-auto">
              {isOwner && (
                <Link
                  href={`/stores/${store.id}/edit`}
                  className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </Link>
              )}
              {!isOwner && isActive && (
                <Link
                  href={chatHref}
                  className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  Chat
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content + sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs */}
          <div className="flex-1 min-w-0">
            <StoreTabs
              storeId={store.id}
              reviews={reviewsForClient}
              info={{
                description: store.description,
                hours: store.hours,
                phone: store.phone,
                whatsapp: store.whatsapp,
                location: store.location,
                mapUrl: store.mapUrl,
              }}
              isOwner={isOwner}
              canReview={canReview}
              existingRating={myReview?.rating}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-border p-5 sticky top-20 space-y-4">
              {/* Owner info */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Sold by
                </p>
                <div className="flex items-center gap-3">
                  {store.owner.avatarUrl ? (
                    <Image
                      src={store.owner.avatarUrl}
                      alt={store.owner.name}
                      width={40}
                      height={40}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center text-sm font-semibold text-accent">
                      {store.owner.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{store.owner.name}</p>
                    {store.owner.username && (
                      <Link
                        href={`/profile/${store.owner.username}`}
                        className="text-xs text-accent hover:underline"
                      >
                        @{store.owner.username}
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat CTA */}
              {!isOwner && isActive && (
                <Link
                  href={chatHref}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shadow-accent-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  Chat with store
                </Link>
              )}

              {/* Quick info */}
              {(store.hours || store.location) && (
                <div className="space-y-2 pt-2 border-t border-border">
                  {store.hours && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {store.hours}
                    </div>
                  )}
                  {store.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {store.location}
                    </div>
                  )}
                  {store.mapUrl && (
                    <a
                      href={store.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-accent hover:underline"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                      </svg>
                      Get directions
                    </a>
                  )}
                </div>
              )}

              {/* Image thumbnails */}
              {store.images.length > 1 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Photos
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {store.images.slice(0, 4).map((img, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-border">
                        <Image src={img} alt={`${store.name} photo ${i + 1}`} fill className="object-cover" sizes="56px" />
                      </div>
                    ))}
                    {store.images.length > 4 && (
                      <div className="w-14 h-14 rounded-xl bg-surface border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground">
                        +{store.images.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

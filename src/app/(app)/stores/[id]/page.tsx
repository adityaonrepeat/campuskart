import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Pencil,
  Navigation,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StoreTabs } from "@/components/stores/store-tabs";
import { StoreGallery } from "@/components/stores/store-gallery";
import { STORE_CATEGORY_LABELS } from "@/types/store";
import type { Role } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={s <= Math.round(value) ? "#F59E0B" : "#D1D5DB"}
          stroke="none"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
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
      menuImages: true,
      tags: true,
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
  const reviewCount = store.reviews.length;

  const avg =
    reviewCount > 0
      ? store.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
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

  const reviewsForClient = store.reviews.map(({ userId: _uid, ...r }) => r);

  const showChat = !isOwner && isActive;
  const hasContact = Boolean(
    store.hours || store.location || store.mapUrl || store.phone || store.whatsapp
  );
  const whatsappHref = store.whatsapp
    ? `https://wa.me/${store.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <div className="bg-surface min-h-screen pb-10">
      {/* Status banner (owner/mod only) */}
      {store.status !== "ACTIVE" && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-800 text-center">
          {store.status === "PENDING"
            ? "⏳ Pending moderator verification — not yet visible to students."
            : "🗄 This store has been archived."}
        </div>
      )}

      {/* Hero */}
      <div className="relative h-52 sm:h-72 overflow-hidden">
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
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-semibold text-white leading-tight">
              {store.name}
            </h1>
            <div className="flex items-center gap-2.5 mt-1.5 text-white/85 text-sm flex-wrap">
              <span>{categoryLabel}</span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="flex items-center gap-1.5">
                <Stars value={avg} size={14} />
                {avg > 0 && <span className="font-semibold text-white">{avg.toFixed(1)}</span>}
                <span className="text-white/70">
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-x-5 gap-y-1 flex-wrap text-xs sm:text-sm text-muted-foreground min-w-0">
            {store.location && (
              <span className="flex items-center gap-1.5 min-w-0">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{store.location}</span>
              </span>
            )}
            {store.hours && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                {store.hours}
              </span>
            )}
          </div>

          {isOwner ? (
            <Link
              href={`/stores/${store.id}/edit`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-surface transition-colors shrink-0"
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit store</span>
              <span className="sm:hidden">Edit</span>
            </Link>
          ) : (
            isActive && (
              <Link
                href={chatHref}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shadow-accent-md shrink-0"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Chat with store</span>
                <span className="sm:hidden">Chat</span>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Main */}
          <div className="min-w-0 space-y-6">
            <StoreGallery
              storefront={store.images}
              menu={store.menuImages}
              storeName={store.name}
            />
            <StoreTabs
              storeId={store.id}
              reviews={reviewsForClient}
              isOwner={isOwner}
              canReview={canReview}
              existingRating={myReview?.rating}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20">
            {/* About */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                About
              </h2>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {store.description}
              </p>
              {store.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {store.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium bg-surface border border-border rounded-full px-2.5 py-1 text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Contact & hours */}
            {hasContact && (
              <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Contact & hours
                </h2>
                {store.hours && (
                  <Row icon={<Clock className="h-4 w-4" />} label="Hours" value={store.hours} />
                )}
                {store.location && (
                  <Row icon={<MapPin className="h-4 w-4" />} label="Location" value={store.location} />
                )}
                {store.phone && (
                  <a href={`tel:${store.phone}`} className="block">
                    <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={store.phone} link />
                  </a>
                )}
                {whatsappHref && (
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="block">
                    <Row
                      icon={<MessageCircle className="h-4 w-4" />}
                      label="WhatsApp"
                      value={store.whatsapp!}
                      link
                    />
                  </a>
                )}
                {store.mapUrl && (
                  <a href={store.mapUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Row
                      icon={<Navigation className="h-4 w-4" />}
                      label="Directions"
                      value="Open in Maps"
                      link
                    />
                  </a>
                )}
              </div>
            )}

            {/* Run by */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Run by
              </h2>
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
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{store.owner.name}</p>
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

              {showChat && (
                <Link
                  href={chatHref}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shadow-accent-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat with store
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  link = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  link?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-0.5 shrink-0 ${link ? "text-accent" : "text-muted-foreground"}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
          {label}
        </p>
        <p className={`text-sm font-medium ${link ? "text-accent" : "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Pencil,
  Navigation,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import { StoreReviews } from "@/components/stores/store-reviews";
import { StoreGallery } from "@/components/stores/store-gallery";
import { StoreChatButton } from "@/components/stores/store-chat-button";
import { STORE_CATEGORY_LABELS } from "@/types/store";
import { canModerate, canViewStore } from "@/lib/permissions";
import { isStoreOpenNow } from "@/lib/store-utils";

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
      tags: true,
      phone: true,
      whatsapp: true,
      location: true,
      mapUrl: true,
      hours: true,
      isVerified: true,
      status: true,
      ownerId: true,
      collegeId: true,
      createdAt: true,
      college: { select: { name: true } },
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

  const isOwner = store.ownerId === session.user.id;
  const isMod = canModerate(session.user);

  if (!canViewStore(session.user, store)) notFound();

  const myReview = store.reviews.find((r) => r.userId === session.user.id);
  const canReview = !isOwner && store.status === "ACTIVE";
  const categoryLabel = STORE_CATEGORY_LABELS[store.category] ?? store.category;
  const isActive = store.status === "ACTIVE";
  const isOpenNow = isActive && isStoreOpenNow(store.hours);
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
  const existingConversationId = existingConversation?.id ?? null;

  const reviewsForClient = store.reviews.map(({ userId: _uid, ...r }) => r);

  const whatsappHref = store.whatsapp
    ? `https://wa.me/${store.whatsapp.replace(/\D/g, "")}`
    : null;
  const hasDirectContact = Boolean(store.phone || whatsappHref || store.mapUrl);

  const galleryImages = store.images;

  return (
    <>
      <AppHeader
        user={{ name: session.user.name ?? "User", avatarUrl: session.user.avatarUrl }}
        forceScrolled
        showAdmin={isMod}
      />

      <div className="min-h-screen bg-surface pt-20">
        {store.status !== "ACTIVE" && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-800 text-center">
            {store.status === "PENDING"
              ? "⏳ Pending moderator verification — not yet visible to students."
              : "🗄 This store has been archived."}
          </div>
        )}

        {/* Breadcrumb */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-muted">
              <Link
                href="/stores"
                className="hover:text-accent transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Stores
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium line-clamp-1">{store.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
            {/* Gallery */}
            <div>
              <StoreGallery
                images={galleryImages}
                storeName={store.name}
                overlay={
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
                    <span
                      className={`tag-pill text-xs font-semibold ${
                        isOpenNow ? "bg-emerald-500 text-white" : "bg-gray-600 text-white"
                      }`}
                    >
                      {isOpenNow ? "Open now" : "Closed"}
                    </span>
                    {store.isVerified && (
                      <span className="tag-pill text-xs font-semibold bg-white/95 text-accent flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                }
              />
            </div>

            {/* RIGHT: info + actions */}
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    {categoryLabel}
                  </span>
                  {store.college?.name && (
                    <>
                      <span className="text-muted text-xs">·</span>
                      <span className="verified-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {store.college.name}
                      </span>
                    </>
                  )}
                </div>
                <h1 className="font-sans text-2xl sm:text-3xl font-semibold text-primary leading-snug">
                  {store.name}
                </h1>
                <div className="flex items-center gap-1.5 mt-2">
                  <Stars value={avg} size={16} />
                  {avg > 0 && (
                    <span className="text-sm font-semibold text-foreground">{avg.toFixed(1)}</span>
                  )}
                  <span className="text-sm text-muted">
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>

              {/* Action card */}
              <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-4">
                {isOwner ? (
                  <Link
                    href={`/stores/${store.id}/edit`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-accent text-accent font-semibold text-sm hover:bg-accent/5 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit store
                  </Link>
                ) : isActive ? (
                  <StoreChatButton
                    storeId={store.id}
                    existingConversationId={existingConversationId}
                  />
                ) : (
                  <p className="text-sm text-muted text-center py-1">
                    This store is currently closed.
                  </p>
                )}

                {hasDirectContact && (
                  <div className="flex flex-wrap gap-2">
                    {store.phone && (
                      <a
                        href={`tel:${store.phone}`}
                        className="flex-1 basis-[calc(50%-0.25rem)] flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-surface transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                    )}
                    {whatsappHref && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 basis-[calc(50%-0.25rem)] flex items-center justify-center gap-2 py-2.5 rounded-xl border border-green-200 bg-green-50 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        WhatsApp
                      </a>
                    )}
                    {store.mapUrl && (
                      <a
                        href={store.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 basis-[calc(50%-0.25rem)] flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-surface transition-colors"
                      >
                        <Navigation className="h-4 w-4" />
                        Directions
                      </a>
                    )}
                  </div>
                )}

                {(store.hours || store.location) && (
                  <div className="space-y-3 pt-3 border-t border-border/60">
                    {store.hours && (
                      <Row icon={<Clock className="h-4 w-4" />} label="Hours" value={store.hours} />
                    )}
                    {store.location && (
                      <Row icon={<MapPin className="h-4 w-4" />} label="Location" value={store.location} />
                    )}
                  </div>
                )}
              </div>

              {/* About */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  About
                </h2>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
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

              {/* Store Owner */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Store Owner
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
                    <p className="text-sm font-semibold text-foreground truncate">
                      {store.owner.name}
                    </p>
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
            </div>
          </div>

          {/* Reviews */}
          <section className="mt-10">
            <StoreReviews
              storeId={store.id}
              reviews={reviewsForClient}
              canReview={canReview}
              existingRating={myReview?.rating}
            />
          </section>
        </div>
      </div>
    </>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

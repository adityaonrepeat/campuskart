"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { markListingSold } from "@/actions/listing-actions";
import type { ListingDetail as ListingDetailType } from "@/types/listing";
import type { ApiResponse } from "@/types/api";

const CONDITION_LABEL: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

const CATEGORY_LABEL: Record<string, string> = {
  BOOKS: "Books",
  ELECTRONICS: "Electronics",
  CLOTHING: "Clothing",
  FURNITURE: "Furniture",
  NOTES: "Notes",
  SPORTS: "Sports",
  OTHER: "Other",
};

function conditionClass(condition: string): string {
  switch (condition) {
    case "NEW":
    case "LIKE_NEW":
      return "bg-emerald-100 text-emerald-700";
    case "GOOD":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-red-100 text-red-700";
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

interface ListingDetailProps {
  listing: ListingDetailType;
  currentUserId: string;
}

export function ListingDetailView({ listing, currentUserId }: ListingDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "seller">("details");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isContacting, setIsContacting] = useState(false);
  const [isMarkingSold, setIsMarkingSold] = useState(false);

  const isOwner = listing.sellerId === currentUserId;
  const isSold = listing.status === "SOLD";
  const isActive = listing.status === "ACTIVE";

  const sellerInitials = listing.seller.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const categoryLabel = CATEGORY_LABEL[listing.category] ?? listing.category;
  const conditionLabel = CONDITION_LABEL[listing.condition] ?? listing.condition;

  async function handleContactSeller(message: string) {
    setIsContacting(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          message: message.trim() || undefined,
        }),
      });
      const json = (await res.json()) as ApiResponse<{ conversationId: string }>;

      if (json.success) {
        setChatMessage("");
        setChatOpen(false);
        router.push(`/chat/${json.data.conversationId}`);
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        return;
      }

      if (json.code === "LISTING_NOT_ACTIVE") {
        toast.error("This item has already been sold.");
        await queryClient.invalidateQueries({ queryKey: ["listings", listing.id] });
        await queryClient.invalidateQueries({ queryKey: ["listings"] });
      } else {
        toast.error(json.error ?? "Failed to open chat.");
      }
      setChatOpen(false);
    } catch {
      toast.error("Failed to open chat. Please try again.");
    } finally {
      setIsContacting(false);
    }
  }

  async function handleMarkSold() {
    if (!confirm("Mark this listing as sold?")) return;
    setIsMarkingSold(true);
    const result = await markListingSold(listing.id);
    setIsMarkingSold(false);
    if (!result.success) {
      toast.error(result.error ?? "Failed to mark as sold.");
      return;
    }
    toast.success("Marked as sold.");
    await queryClient.invalidateQueries({ queryKey: ["listings"] });
    router.refresh();
  }

  return (
    <>
      <div className="min-h-screen bg-surface pt-20">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-muted">
              <button
                type="button"
                onClick={() => router.back()}
                className="hover:text-accent transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </button>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              <Link href="/listings" className="hover:text-accent transition-colors">Listings</Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              <span className="text-foreground font-medium line-clamp-1">{listing.title}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

            {/* LEFT: Images */}
            <div>
              {/* Main image */}
              <div
                className="relative rounded-2xl overflow-hidden bg-white border border-border aspect-4/3 mb-3 cursor-zoom-in group/img"
                onClick={() => listing.images[activeImage] && setLightboxOpen(true)}
              >
                {listing.images[activeImage] ? (
                  <Image
                    src={listing.images[activeImage]}
                    alt={listing.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                    No image
                  </div>
                )}

                {/* Condition badge */}
                <span className={cn("absolute top-4 right-4 tag-pill text-xs", conditionClass(listing.condition))}>
                  {conditionLabel}
                </span>

                {/* Negotiable badge */}
                {listing.listingType === "NEGOTIABLE" && !isSold && (
                  <span className="absolute top-4 left-4 tag-pill bg-amber-100 text-amber-700 text-xs">
                    Negotiable
                  </span>
                )}

                {/* Sold overlay */}
                {isSold && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="tag-pill bg-red-600 text-white font-bold" style={{ fontSize: 14 }}>Sold</span>
                  </div>
                )}

                {/* Image counter badge */}
                {listing.images.length > 0 && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="white" stroke="none" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span className="text-white text-[11px] font-medium">{activeImage + 1} / {listing.images.length}</span>
                  </div>
                )}

                {/* Zoom hint on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
                    </svg>
                    <span className="text-white text-xs font-medium">Click to zoom</span>
                  </div>
                </div>

                {/* Prev / Next arrows */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p - 1 + listing.images.length) % listing.images.length); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p + 1) % listing.images.length); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {listing.images.length > 1 && (
                <div className="flex gap-2">
                  {listing.images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0",
                        activeImage === i ? "border-accent shadow-md" : "border-border hover:border-accent/40"
                      )}
                    >
                      <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Info + Actions */}
            <div className="flex flex-col gap-5">
              {/* Category + Title */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">{categoryLabel}</span>
                  <span className="text-muted text-xs">·</span>
                  <span className="verified-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    {listing.seller.college?.name ?? ""}
                  </span>
                </div>
                <h1 className="font-sans text-2xl sm:text-3xl font-semibold text-primary leading-snug">
                  {listing.title}
                </h1>
              </div>

              {/* Price card */}
              <div className="bg-white rounded-2xl border border-border p-5">
                {isSold && (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                    This item has been sold and is no longer available.
                  </div>
                )}

                <div className="grid grid-cols-2 mb-5">
                  <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">Current Price</p>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1 text-right">Condition</p>
                  <p className="font-sans text-4xl font-semibold text-accent self-center">
                    ₹{listing.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-lg font-semibold text-foreground text-right self-center">{conditionLabel}</p>
                  <p className="text-sm font-medium text-muted mt-1">
                    {listing.listingType === "NEGOTIABLE" ? "Negotiable" : "Fixed price"}
                  </p>
                  <p className="text-xs text-muted mt-1 text-right">{timeAgo(new Date(listing.createdAt))}</p>
                </div>

                {isOwner ? (
                  <button
                    type="button"
                    onClick={handleMarkSold}
                    disabled={isMarkingSold || isSold}
                    className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors bg-accent hover:bg-accent/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {isMarkingSold ? "Marking…" : isSold ? "Already Sold" : "Mark as Sold"}
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className={cn(
                        "w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200",
                        isActive ? "bg-accent hover:bg-accent/90" : "bg-gray-400 cursor-not-allowed"
                      )}
                      disabled={!isActive}
                      onClick={() => isActive && setChatOpen(true)}
                    >
                      {isSold ? "Item Sold" : "Buy Now"}
                    </button>
                    {isActive && (
                      <button
                        type="button"
                        onClick={() => handleContactSeller("")}
                        disabled={isContacting}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors border border-accent text-accent hover:bg-accent/5 disabled:opacity-60"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        {isContacting ? "Opening…" : "Contact Seller"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Tabs: Details + Seller */}
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="flex border-b border-border">
                  {(["details", "seller"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 py-3 text-sm font-semibold capitalize transition-colors",
                        activeTab === tab ? "auth-tab-active" : "auth-tab-inactive"
                      )}
                    >
                      {tab === "details" ? "Details" : "Seller"}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {activeTab === "details" && (
                    <div>
                      <p className="text-sm text-muted leading-relaxed mb-4">{listing.description}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Condition", value: conditionLabel },
                          { label: "Category", value: categoryLabel },
                          { label: "Listed", value: timeAgo(new Date(listing.createdAt)) },
                          { label: "Pickup", value: "On Campus" },
                        ].map((row) => (
                          <div key={row.label} className="bg-surface rounded-xl p-3">
                            <p className="text-[10px] text-muted uppercase tracking-wider mb-1">{row.label}</p>
                            <p className="text-sm font-semibold text-foreground">{row.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "seller" && (
                    <div>
                      {/* Avatar + name */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border shrink-0 bg-accent/10 flex items-center justify-center text-accent font-semibold text-base">
                          {listing.seller.avatarUrl ? (
                            <Image
                              src={listing.seller.avatarUrl}
                              alt={listing.seller.name}
                              width={56}
                              height={56}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            sellerInitials
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-base leading-snug">{listing.seller.name}</p>
                          {listing.seller.username && (
                            <p className="text-xs text-muted mt-0.5">@{listing.seller.username}</p>
                          )}
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {[
                          { label: "MEMBER SINCE", value: "Sep 2023" },
                          { label: "TOTAL SALES", value: "14 items" },
                          { label: "RESPONSE TIME", value: "Usually within 1 hour" },
                          { label: "COLLEGE", value: listing.seller.college?.name ?? "" },
                        ].map((row) => (
                          <div key={row.label} className="bg-surface rounded-xl p-3">
                            <p className="text-[10px] text-muted uppercase tracking-wider mb-1">{row.label}</p>
                            <p className="text-sm font-semibold text-foreground">{row.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Action icon buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="flex-1 py-3 rounded-xl border border-border flex items-center justify-center hover:border-accent/40 hover:bg-accent/5 transition-colors"
                          aria-label="Save listing"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.75">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="flex-1 py-3 rounded-xl border border-border flex items-center justify-center hover:border-red-200 hover:bg-red-50 transition-colors"
                          aria-label="Report listing"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.75">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                            <line x1="4" y1="22" x2="4" y2="15" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Contact drawer */}
      {chatOpen && (
        <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setChatOpen(false)}
          />
          <div
            className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-96 shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "80vh" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-white">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-border shrink-0 bg-accent/10 flex items-center justify-center text-accent text-xs font-semibold">
                {listing.seller.avatarUrl ? (
                  <Image
                    src={listing.seller.avatarUrl}
                    alt={listing.seller.name}
                    width={36}
                    height={36}
                    className="object-cover"
                  />
                ) : (
                  sellerInitials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{listing.seller.name}</p>
                <p className="text-[11px] text-muted">{listing.seller.college?.name ?? ""}</p>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="text-muted hover:text-foreground transition-colors p-1"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Item preview */}
            <div className="flex-1 overflow-y-auto p-4 bg-surface">
              <div className="bg-white rounded-xl border border-border p-3 flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{listing.title}</p>
                  <p className="text-xs text-accent font-semibold">₹{listing.price.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <p className="text-xs text-muted text-center px-4">
                Send a message to start a conversation with the seller.
              </p>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-white flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isContacting && handleContactSeller(chatMessage)}
                placeholder="Hi! Is this still available?"
                className="input-field text-sm py-2.5"
                disabled={isContacting}
              />
              <button
                type="button"
                onClick={() => handleContactSeller(chatMessage)}
                disabled={isContacting}
                className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors shrink-0 disabled:opacity-50"
                aria-label="Send message"
              >
                {isContacting ? (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25" />
                    <path d="M21 12a9 9 0 00-9-9" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && listing.images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/92"
          onClick={() => setLightboxOpen(false)}
        >
          {/* X button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Main image */}
          <div
            className="relative"
            style={{ width: "min(80vw, 860px)", height: listing.images.length > 1 ? "min(72vh, 620px)" : "min(82vh, 700px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={listing.images[activeImage]}
              alt={listing.title}
              fill
              className="object-contain"
              sizes="80vw"
            />

            {/* Prev arrow */}
            {listing.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p - 1 + listing.images.length) % listing.images.length); }}
                  className="absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p + 1) % listing.images.length); }}
                  className="absolute -right-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </>
            )}
          </div>

          {/* Counter + thumbnail strip */}
          {listing.images.length > 1 && (
            <div className="mt-4 flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <span className="text-white/50 text-xs font-medium">{activeImage + 1} / {listing.images.length}</span>
              <div className="flex gap-2">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 transition-all duration-200"
                    style={{ border: activeImage === i ? "2px solid #fff" : "2px solid rgba(255,255,255,0.2)" }}
                  >
                    <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

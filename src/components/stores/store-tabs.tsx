"use client";

import { useState } from "react";
import Image from "next/image";
import { ListingGrid } from "@/components/listings/listing-grid";
import { StoreReviewForm } from "@/components/stores/store-review-form";

interface Review {
  id: string;
  rating: number;
  body: string | null;
  createdAt: Date;
  user: { id: string; name: string; avatarUrl: string | null };
}

interface StoreInfo {
  description: string;
  hours: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  mapUrl: string | null;
}

interface StoreTabsProps {
  storeId: string;
  reviews: Review[];
  info: StoreInfo;
  isOwner: boolean;
  canReview: boolean;
  existingRating?: number;
}

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"}
          stroke="none"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

const INFO_ICONS = {
  hours: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  location: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  phone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
    </svg>
  ),
  map: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  ),
};

export function StoreTabs({
  storeId,
  reviews,
  info,
  isOwner,
  canReview,
  existingRating,
}: StoreTabsProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "reviews" | "info">("listings");

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const tabs: { key: "listings" | "reviews" | "info"; label: string }[] = [
    { key: "listings", label: "Listings" },
    { key: "reviews", label: `Reviews (${reviews.length})` },
    { key: "info", label: "Info" },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-border rounded-xl p-1 w-fit mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
              activeTab === t.key
                ? "bg-accent text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* LISTINGS TAB */}
      {activeTab === "listings" && (
        <ListingGrid filters={{ storeId }} />
      )}

      {/* REVIEWS TAB */}
      {activeTab === "reviews" && (
        <div className="space-y-5">
          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="font-display text-5xl font-semibold text-primary">
                    {avg.toFixed(1)}
                  </p>
                  <StarRating rating={avg} size={16} />
                  <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = Math.round((count / reviews.length) * 100);
                    return (
                      <div key={star} className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground w-3">{star}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Review list */}
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No reviews yet. Be the first!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex items-start gap-3 mb-3">
                    {review.user.avatarUrl ? (
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={review.user.avatarUrl}
                          alt={review.user.name}
                          width={36}
                          height={36}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-accent-muted flex items-center justify-center shrink-0 text-sm font-semibold text-accent">
                        {review.user.name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {review.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                  </div>
                  {review.body && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Write a review */}
          {canReview && (
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-display text-lg font-semibold text-primary mb-4">
                {existingRating ? "Update your review" : "Write a review"}
              </h3>
              <StoreReviewForm storeId={storeId} existingRating={existingRating} />
            </div>
          )}
        </div>
      )}

      {/* INFO TAB */}
      {activeTab === "info" && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              About
            </h3>
            <p className="text-sm text-foreground leading-relaxed">{info.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {info.hours && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface">
                <span className="text-accent mt-0.5">{INFO_ICONS.hours}</span>
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Hours</p>
                  <p className="text-sm text-foreground font-medium">{info.hours}</p>
                </div>
              </div>
            )}
            {info.location && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface">
                <span className="text-accent mt-0.5">{INFO_ICONS.location}</span>
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Location</p>
                  <p className="text-sm text-foreground font-medium">{info.location}</p>
                </div>
              </div>
            )}
            {info.phone && (
              <a
                href={`tel:${info.phone}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-surface hover:bg-surface-2 transition-colors"
              >
                <span className="text-accent mt-0.5">{INFO_ICONS.phone}</span>
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Phone</p>
                  <p className="text-sm text-accent font-medium">{info.phone}</p>
                </div>
              </a>
            )}
            {info.whatsapp && (
              <a
                href={`https://wa.me/${info.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl bg-surface hover:bg-surface-2 transition-colors"
              >
                <span className="text-accent mt-0.5">{INFO_ICONS.phone}</span>
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">WhatsApp</p>
                  <p className="text-sm text-accent font-medium">{info.whatsapp}</p>
                </div>
              </a>
            )}
            {info.mapUrl && (
              <a
                href={info.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl bg-surface hover:bg-surface-2 transition-colors"
              >
                <span className="text-accent mt-0.5">{INFO_ICONS.map}</span>
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Directions</p>
                  <p className="text-sm text-accent font-medium">Open in Maps</p>
                </div>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

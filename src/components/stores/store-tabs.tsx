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

interface StoreTabsProps {
  storeId: string;
  reviews: Review[];
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

export function StoreTabs({ storeId, reviews, isOwner, canReview, existingRating }: StoreTabsProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const tabs: { key: "listings" | "reviews"; label: string }[] = [
    { key: "listings", label: "Listings" },
    { key: "reviews", label: `Reviews (${reviews.length})` },
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

      {activeTab === "listings" && <ListingGrid filters={{ storeId }} />}

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
    </div>
  );
}

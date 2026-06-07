"use client";

import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import type { ListingCard as ListingCardType } from "@/types/listing";

const CATEGORY_LABEL: Record<string, string> = {
  BOOKS: "Textbooks",
  ELECTRONICS: "Electronics",
  CLOTHING: "Clothing",
  FURNITURE: "Furniture",
  NOTES: "Notes",
  SPORTS: "Sports & Fitness",
  OTHER: "Other",
};

const CONDITION_LABEL: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

function conditionColor(condition: string): string {
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

export default function ListingCard({ listing }: { listing: ListingCardType }) {
  const href = `/listings/${listing.id}`;
  const isSold = listing.status === "SOLD";
  const isArchived = listing.status === "ARCHIVED";
  const isDimmed = isSold || isArchived;
  const sellerName = listing.seller?.name ?? "Unknown";
  const initials = sellerName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href={href}
      className={`listing-card group block ${isDimmed ? "opacity-70" : ""}`}
    >
      {/* Image */}
      <div className="img-zoom relative h-60">
        {listing.images[0] ? (
          <AppImage
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface text-xs text-muted">
            No image
          </div>
        )}
        <span className={`absolute top-3 left-3 tag-pill text-[10px] ${conditionColor(listing.condition)}`}>
          {CONDITION_LABEL[listing.condition] ?? listing.condition}
        </span>
        {listing.listingType === "NEGOTIABLE" && !isDimmed && (
          <span className="absolute top-3 right-3 tag-pill bg-accent text-white text-[10px]">
            Negotiable
          </span>
        )}
        {isSold && (
          <span className="absolute top-3 right-3 tag-pill bg-red-500 text-white text-[10px]">
            Sold
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3 pt-2.5 pb-3">
        <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
          {CATEGORY_LABEL[listing.category] ?? listing.category}
        </span>
        <h3 className="font-semibold text-foreground text-base leading-snug mt-0.5 mb-1.5 line-clamp-2 group-hover:text-accent transition-colors">
          {listing.title}
        </h3>

        {/* Seller row */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-border bg-accent-muted flex items-center justify-center text-[8px] font-semibold text-accent">
            {listing.seller?.avatarUrl ? (
              <AppImage
                src={listing.seller.avatarUrl}
                alt={sellerName}
                width={20}
                height={20}
                className="object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <span className="text-xs text-muted truncate">{sellerName}</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mb-2 pb-2 border-b border-border">
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Price</p>
            <p className="text-xl font-display font-semibold text-accent">
              ₹{listing.price.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Type</p>
            <p className="text-sm font-semibold text-foreground">
              {listing.listingType === "NEGOTIABLE" ? "Negotiable" : "Fixed Price"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <span className="flex-1 text-center bg-accent text-white text-xs font-semibold py-2 rounded-[11px] group-hover:bg-accent/90 transition-colors duration-200">
            View Details
          </span>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-border text-muted hover:text-accent hover:border-accent/40 transition-colors duration-200"
            aria-label="Save listing"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}

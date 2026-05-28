import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ListingCard } from "@/types/listing";

const CONDITION_LABEL: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

interface ListingCardProps {
  listing: ListingCard;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const isSold = listing.status === "SOLD";
  const isArchived = listing.status === "ARCHIVED";
  const isDimmed = isSold || isArchived;

  return (
    <Link href={`/listings/${listing.id}`} className={cn("block group", className)}>
      <div
        className={cn(
          "rounded-xl border overflow-hidden bg-card transition-shadow hover:shadow-md",
          isDimmed && "opacity-70"
        )}
      >
        <div className="relative aspect-square bg-muted overflow-hidden">
          {listing.images[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}

          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                Sold
              </span>
            </div>
          )}
          {isArchived && !isSold && (
            <div className="absolute top-2 left-2">
              <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                Archived
              </span>
            </div>
          )}
        </div>

        <div className="p-3 space-y-1">
          <p className="font-semibold text-sm leading-snug line-clamp-2">
            {listing.title}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-primary">
              ₹{listing.price.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-muted-foreground">
              {CONDITION_LABEL[listing.condition] ?? listing.condition}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

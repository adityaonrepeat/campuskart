import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORE_CATEGORY_LABELS } from "@/types/store";
import type { StoreCard } from "@/types/store";

interface StoreCardProps {
  store: StoreCard;
  className?: string;
}

function StarRating({ count, total }: { count: number; total: number }) {
  const avg = total > 0 ? count / total : 0;
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="text-xs font-medium text-foreground">
        {avg > 0 ? avg.toFixed(1) : "—"}
      </span>
      <span className="text-xs text-muted-foreground">({total})</span>
    </div>
  );
}

export function StoreCard({ store, className }: StoreCardProps) {
  const reviewCount = store._count.reviews;
  const categoryLabel = STORE_CATEGORY_LABELS[store.category] ?? store.category;

  return (
    <Link href={`/stores/${store.id}`} className={cn("block group", className)}>
      <div className="rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/9] bg-muted overflow-hidden">
          {store.images[0] ? (
            <Image
              src={store.images[0]}
              alt={store.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
              <span className="text-4xl">🏪</span>
            </div>
          )}

          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-0.5 rounded-full text-foreground">
              {categoryLabel}
            </span>
            {store.isVerified && (
              <span className="verified-blue text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Verified
              </span>
            )}
          </div>
        </div>

        <div className="p-3 space-y-2">
          <p className="font-semibold text-sm leading-snug line-clamp-1">{store.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{store.description}</p>

          <div className="flex items-center justify-between pt-0.5">
            <StarRating count={0} total={reviewCount} />
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {store.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1 max-w-[80px]">{store.location}</span>
                </span>
              )}
              {store.hours && (
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  <span className="line-clamp-1 max-w-[80px]">{store.hours}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

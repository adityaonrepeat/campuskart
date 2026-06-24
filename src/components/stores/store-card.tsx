import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { STORE_CATEGORY_LABELS } from "@/types/store";
import type { StoreCard } from "@/types/store";
import { isStoreOpenNow } from "@/lib/store-utils";

interface StoreCardProps {
  store: StoreCard;
  featured?: boolean;
}

export function StoreCard({ store, featured = false }: StoreCardProps) {
  const reviewCount = store._count.reviews;
  const categoryLabel = STORE_CATEGORY_LABELS[store.category] ?? store.category;
  const isActive = store.status === "ACTIVE";
  const isOpenNow = isActive && isStoreOpenNow(store.hours);
  const visibleTags = store.tags.slice(0, 3);

  return (
    <Link
      href={`/stores/${store.id}`}
      className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {store.images[0] ? (
          <Image
            src={store.images[0]}
            alt={store.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
            <span className="text-5xl">🏪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-amber-900 text-[10px] font-bold">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              FEATURED
            </span>
          )}
          <span
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold",
              isOpenNow ? "bg-green-500 text-white" : "bg-gray-500 text-white"
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", isOpenNow ? "bg-white" : "bg-gray-300")} />
            {isOpenNow ? "OPEN" : "CLOSED"}
          </span>
        </div>

        {/* Category pill at image bottom */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold border border-white/20">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-sans text-base font-semibold text-primary group-hover:text-accent transition-colors leading-tight line-clamp-1">
            {store.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[11px] text-muted-foreground">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
          {store.description}
        </p>

        {/* Tags row: real tags from DB */}
        {visibleTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {visibleTags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-surface text-[10px] font-medium text-muted-foreground border border-border"
              >
                {t.toLowerCase()}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2 py-0.5 rounded-full bg-surface text-[10px] font-medium text-muted-foreground border border-border">
              {categoryLabel.toLowerCase()}
            </span>
            {store.location && (
              <span className="px-2 py-0.5 rounded-full bg-surface text-[10px] font-medium text-muted-foreground border border-border">
                on-campus
              </span>
            )}
          </div>
        )}

        {/* Meta bar */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {store.hours ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="truncate">{store.hours}</span>
              </>
            ) : store.location ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="truncate max-w-27.5">{store.location}</span>
              </>
            ) : (
              <span className="text-[11px]">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
            )}
          </div>
          <span className="text-xs font-semibold text-accent flex items-center gap-1 shrink-0">
            View Store
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

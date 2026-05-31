"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import ListingCard from "./ListingCard";
import { ListingSkeleton } from "./listing-skeleton";
import type { PaginatedResponse } from "@/types/api";
import type { ListingCard as ListingCardType, ListingFilters } from "@/types/listing";

type TabType = "all" | "bidding" | "buynow" | "stores";

const TABS: { id: TabType; label: string }[] = [
  { id: "all", label: "All Listings" },
  { id: "buynow", label: "Fixed Price" },
  { id: "bidding", label: "Negotiable" },
  { id: "stores", label: "Campus Stores" },
];

// Only sort options the API actually supports.
const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

async function fetchListings(
  params: Record<string, string | undefined>,
  pageParam: string | undefined
): Promise<PaginatedResponse<ListingCardType>> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  if (pageParam) qs.set("cursor", pageParam);

  const res = await fetch(`/api/listings?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch listings");
  const json = (await res.json()) as {
    success: true;
    data: PaginatedResponse<ListingCardType>;
  };
  return json.data;
}

interface ListingsGridProps {
  filters: ListingFilters;
}

export default function ListingsGrid({ filters }: ListingsGridProps) {
  const [activeTab, setActiveTab] = useState<TabType>(
    (filters.tab as TabType) ?? "all"
  );
  const [sort, setSort] = useState(filters.sort ?? "newest");
  const [search, setSearch] = useState(filters.search ?? "");
  const gridRef = useRef<HTMLDivElement>(null);

  // Debounce the search box so we don't refetch on every keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams: Record<string, string | undefined> = {
    category: filters.category,
    condition: filters.condition,
    priceMin: filters.priceMin?.toString(),
    priceMax: filters.priceMax?.toString(),
    search: debouncedSearch || undefined,
    sort,
    tab: activeTab === "stores" ? "all" : activeTab,
  };

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["listings", queryParams],
    queryFn: ({ pageParam }) =>
      fetchListings(queryParams, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
    enabled: activeTab !== "stores",
  });

  const listings = data?.pages.flatMap((p) => p.items) ?? [];

  // Reveal-on-scroll animation for cards.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.08 }
    );
    gridRef.current
      ?.querySelectorAll(".aos-elem")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [listings.length]);

  return (
    <div ref={gridRef}>
      {/* Search + Sort + List an Item — three equal-width columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 -mt-2 text-muted pointer-events-none"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full h-11 pl-10 pr-4 rounded-[10px] border border-[#E5E4E0] bg-white text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full h-11 pl-4 pr-9 rounded-[10px] border border-[#E5E4E0] bg-white text-sm text-[#111111] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all appearance-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* List an Item */}
        <Link
          href="/listings/new"
          className="btn-shimmer w-full h-11 flex items-center justify-center gap-2 text-white font-semibold rounded-xl text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          List an Item
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1 border border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === t.id
                ? "bg-white text-accent shadow-card border border-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Campus Stores tab → redirect users to the stores experience */}
      {activeTab === "stores" ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-accent-muted flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h3 className="font-display text-2xl font-semibold text-foreground mb-2">Campus Stores</h3>
          <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
            Browse food, drinks, and supplies from verified campus businesses at your college.
          </p>
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 btn-shimmer text-white font-semibold px-6 py-3 rounded-xl text-sm"
          >
            Explore Campus Stores
          </Link>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">
              {isLoading ? (
                "Loading listings…"
              ) : (
                <>
                  <span className="font-semibold text-foreground">{listings.length}</span>
                  {hasNextPage ? "+" : ""} listing{listings.length !== 1 ? "s" : ""} found
                </>
              )}
            </p>
          </div>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h3 className="font-semibold text-foreground text-base mb-2">Couldn’t load listings</h3>
              <p className="text-muted text-sm">Please refresh the page and try again.</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && listings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4 border border-border">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground text-base mb-2">No listings found</h3>
              <p className="text-muted text-sm">Try adjusting your search or filters.</p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map((listing, i) => (
                <div
                  key={listing.id}
                  className={`aos-elem delay-${Math.min(((i % 6) + 1) * 100, 500)}`}
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 border border-border bg-white text-foreground text-sm font-semibold px-8 py-3 rounded-xl hover:border-accent/40 hover:text-accent transition-all duration-200 shadow-card disabled:opacity-60"
              >
                {isFetchingNextPage ? "Loading…" : "Load More Listings"}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

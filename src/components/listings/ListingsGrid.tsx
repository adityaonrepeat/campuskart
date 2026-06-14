"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Menu } from "@base-ui/react/menu";
import { Drawer } from "@base-ui/react/drawer";
import ListingCard from "./ListingCard";
import { ListingSkeleton } from "./listing-skeleton";
import type { PaginatedResponse } from "@/types/api";
import type { ListingCard as ListingCardType, ListingFilters } from "@/types/listing";

type TabType = "all" | "bidding" | "buynow";

const TABS: { id: TabType; label: string }[] = [
  { id: "all", label: "All Listings" },
  { id: "buynow", label: "Fixed Price" },
  { id: "bidding", label: "Negotiable" },
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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
    tab: activeTab,
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
    enabled: true,
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
      {/* Search: full width */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3.5 top-[calc(50%-7.5px)] -translate-y-1/2 text-muted pointer-events-none"
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
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#E5E4E0] bg-white text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
        />
      </div>

      {/* Chips row + controls */}
      <div className="flex items-center justify-between gap-3 mb-6">
        {/* Scrollable filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1" style={{ scrollbarWidth: "none" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${activeTab === t.id
                ? "bg-accent text-white shadow-sm"
                : "bg-white border border-[#E5E4E0] text-muted hover:text-foreground hover:border-accent/40"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop sort: @base-ui Menu (CSS-hidden on mobile) */}
          <div className="sort-btn-desktop">
            <Menu.Root>
              <Menu.Trigger
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E4E0] bg-white text-sm font-semibold text-[#111111] hover:border-accent/30 transition-colors cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M7 12h10M11 18h2" />
                </svg>
                Sort
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner side="bottom" align="end" sideOffset={6} className="isolate z-50">
                  <Menu.Popup className="min-w-[190px] rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-[#E5E4E0] py-1.5 outline-none">
                    {SORT_OPTIONS.map((opt) => (
                      <Menu.Item
                        key={opt.value}
                        onClick={() => setSort(opt.value)}
                        className={`flex items-center justify-between gap-4 mx-1.5 px-3.5 py-2.5 text-sm rounded-lg cursor-pointer outline-none transition-colors data-[highlighted]:bg-[#F8F7F4] ${sort === opt.value ? "text-accent font-semibold" : "text-foreground"}`}
                      >
                        {opt.label}
                        {sort === opt.value && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>

          {/* Mobile sort: @base-ui Drawer (CSS-hidden on desktop) */}
          <div className="sort-btn-mobile">
            <Drawer.Root open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
              <Drawer.Trigger
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E5E4E0] bg-white text-sm font-semibold text-[#111111]"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M7 12h10M11 18h2" />
                </svg>
                Sort
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Backdrop className="fixed inset-0 bg-black/40 z-40" />
                <Drawer.Viewport className="fixed inset-0 z-50 pointer-events-none">
                  <Drawer.Popup className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl pt-4 pb-6 shadow-2xl outline-none pointer-events-auto">
                    <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                    <p className="text-base font-semibold text-foreground px-6 mb-3">Sort By</p>
                    <div className="flex flex-col">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setSort(opt.value); setMobileDrawerOpen(false); }}
                          className={`flex items-center justify-between px-6 py-4 text-sm font-medium transition-colors ${sort === opt.value ? "text-accent bg-accent/5" : "text-foreground hover:bg-surface"}`}
                        >
                          {opt.label}
                          {sort === opt.value && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </Drawer.Popup>
                </Drawer.Viewport>
              </Drawer.Portal>
            </Drawer.Root>
          </div>

          {/* List an Item: desktop only (mobile uses hamburger) */}
          <Link
            href="/listings/new"
            className="list-item-btn-desktop items-center gap-1.5 bg-accent text-white font-semibold rounded-xl text-sm px-4 py-2 hover:bg-accent/90 transition-colors whitespace-nowrap"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            List an Item
          </Link>
        </div>
      </div>

      <>
        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
    </div>
  );
}

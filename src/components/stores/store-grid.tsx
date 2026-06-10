"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { StoreCard } from "./store-card";
import { Button } from "@/components/ui/button";
import { isStoreOpenNow } from "@/lib/store-utils";
import type { PaginatedResponse } from "@/types/api";
import type { StoreCard as StoreCardType } from "@/types/store";

async function fetchStores(
  filters: { tag?: string; search?: string },
  pageParam: string | undefined
): Promise<PaginatedResponse<StoreCardType>> {
  const params = new URLSearchParams();
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.search) params.set("search", filters.search);
  if (pageParam) params.set("cursor", pageParam);

  const res = await fetch(`/api/stores?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch stores");
  const json = await res.json() as { success: true; data: PaginatedResponse<StoreCardType> };
  return json.data;
}

interface StoreGridProps {
  filters?: { tag?: string; search?: string };
  openOnly?: boolean;
}

export function StoreGrid({ filters = {}, openOnly = false }: StoreGridProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["stores", filters],
      queryFn: ({ pageParam }) =>
        fetchStores(filters, pageParam as string | undefined),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 30_000,
    });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
            <div className="h-44 bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const allStores = data?.pages.flatMap((p) => p.items) ?? [];
  const stores = openOnly
    ? allStores.filter((s) => s.status === "ACTIVE" && isStoreOpenNow(s.hours))
    : allStores;
  const featured = stores.filter((s) => s.isVerified);
  const regular = stores.filter((s) => !s.isVerified);

  if (stores.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="font-display text-lg font-semibold text-primary mb-1">No stores found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {featured.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold text-primary mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Verified Stores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((store) => (
              <StoreCard key={store.id} store={store} featured />
            ))}
          </div>
        </section>
      )}

      {regular.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold text-primary mb-4">
            All Stores
            <span className="ml-2 text-sm font-normal text-muted-foreground">({regular.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {regular.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-xl px-8"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { StoreCard } from "./store-card";
import { Button } from "@/components/ui/button";
import type { PaginatedResponse } from "@/types/api";
import type { StoreCard as StoreCardType } from "@/types/store";

async function fetchStores(
  filters: { category?: string; search?: string },
  pageParam: string | undefined
): Promise<PaginatedResponse<StoreCardType>> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (pageParam) params.set("cursor", pageParam);

  const res = await fetch(`/api/stores?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch stores");
  const json = await res.json() as { success: true; data: PaginatedResponse<StoreCardType> };
  return json.data;
}

interface StoreGridProps {
  filters?: { category?: string; search?: string };
}

export function StoreGrid({ filters = {} }: StoreGridProps) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden animate-pulse">
            <div className="aspect-[16/9] bg-muted" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stores = data?.pages.flatMap((p) => p.items) ?? [];

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-4xl mb-3">🏪</p>
        <p className="text-lg font-medium">No stores yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Campus stores will appear here once verified.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

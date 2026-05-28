"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ListingCard } from "./listing-card";
import { ListingGridSkeleton } from "./listing-skeleton";
import { Button } from "@/components/ui/button";
import type { PaginatedResponse } from "@/types/api";
import type { ListingCard as ListingCardType, ListingFilters } from "@/types/listing";

async function fetchListings(
  filters: ListingFilters,
  pageParam: string | undefined
): Promise<PaginatedResponse<ListingCardType>> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.storeId) params.set("storeId", filters.storeId);
  if (pageParam) params.set("cursor", pageParam);
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`/api/listings?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch listings");
  const json = await res.json() as { success: true; data: PaginatedResponse<ListingCardType> };
  return json.data;
}

interface ListingGridProps {
  filters?: ListingFilters;
}

export function ListingGrid({ filters = {} }: ListingGridProps) {
  const queryKey = ["listings", filters];

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) =>
        fetchListings(filters, pageParam as string | undefined),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 30_000,
    });

  if (isLoading) return <ListingGridSkeleton />;

  const listings = data?.pages.flatMap((p) => p.items) ?? [];

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">No listings yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Be the first to sell something at your college!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
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

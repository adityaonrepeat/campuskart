import { ListingGridSkeleton } from "@/components/listings/listing-skeleton";

export default function ListingsLoading() {
  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-8 w-full animate-pulse rounded-full bg-muted" />
      <ListingGridSkeleton count={8} />
    </div>
  );
}

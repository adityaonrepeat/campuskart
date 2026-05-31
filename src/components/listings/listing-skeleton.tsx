import { cn } from "@/lib/utils";

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-[#F1F0EC]", className)} />
  );
}

export function ListingSkeleton() {
  return (
    <div className="listing-card">
      <SkeletonBox className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-3 w-16" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-5 w-5 rounded-full" />
          <SkeletonBox className="h-3 w-24" />
        </div>
        <SkeletonBox className="h-5 w-28 rounded-full" />
        <div className="pt-1 border-t border-[#E5E4E0]">
          <SkeletonBox className="h-3 w-10 mt-2 mb-1" />
          <SkeletonBox className="h-6 w-20" />
        </div>
        <SkeletonBox className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="listings-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ListingSkeleton key={i} />
      ))}
    </div>
  );
}

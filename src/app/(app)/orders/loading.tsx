function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-[#E5E4E0] ${className ?? ""}`} />
  );
}

function OrderCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl border border-[#E5E4E0]">
      <Skeleton className="w-[100px] h-[100px] rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-7 w-24 rounded-lg" />
        <Skeleton className="h-4 w-8" />
      </div>
    </div>
  );
}

export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="pt-24 pb-8 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
          <div className="flex gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-white border border-[#E5E4E0] rounded-xl px-4 py-3"
              >
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-6" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cream panel skeleton */}
      <div className="bg-[#F8F7F4] border-t border-[#E5E4E0] min-h-[60vh] pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
          <Skeleton className="h-10 w-64 rounded-xl mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

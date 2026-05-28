function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

function OrderCardSkeleton() {
  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="flex gap-3">
        <SkeletonBox className="h-14 w-14 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-4 w-2/3" />
          <SkeletonBox className="h-4 w-1/3" />
        </div>
        <SkeletonBox className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-2">
        <SkeletonBox className="h-8 w-24 rounded-lg" />
        <SkeletonBox className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export default function OrdersLoading() {
  return (
    <div className="py-6 space-y-8">
      <SkeletonBox className="h-8 w-24" />
      {["Buying", "Selling"].map((label) => (
        <section key={label} className="space-y-3">
          <SkeletonBox className="h-4 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </section>
      ))}
    </div>
  );
}

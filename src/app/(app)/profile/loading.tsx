function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

export default function ProfileLoading() {
  return (
    <div className="py-6 space-y-6">
      <div className="flex items-start gap-4">
        <SkeletonBox className="h-20 w-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <SkeletonBox className="h-5 w-40" />
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-4 w-52" />
          <div className="flex gap-4 mt-3">
            <SkeletonBox className="h-10 w-12" />
            <SkeletonBox className="h-10 w-12" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border overflow-hidden">
            <SkeletonBox className="aspect-square w-full rounded-none" />
            <div className="p-3 space-y-2">
              <SkeletonBox className="h-3 w-3/4" />
              <SkeletonBox className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

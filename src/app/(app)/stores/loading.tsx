function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#F1F0EC] ${className ?? ""}`} />;
}

function StoreCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E4E0] overflow-hidden">
      <Pulse className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <Pulse className="h-3 w-16" />
          <Pulse className="h-5 w-16 rounded-full" />
        </div>
        <Pulse className="h-5 w-3/4" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Pulse key={i} className="h-3 w-3 rounded-none" />
          ))}
          <Pulse className="h-3 w-10 ml-1" />
        </div>
        <div className="flex gap-1.5 pt-1">
          <Pulse className="h-5 w-14 rounded-full" />
          <Pulse className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function StoresLoading() {
  return (
    <div>
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E4E0] h-16" />

      {/* Sticky search bar */}
      <div className="bg-white border-b border-[#E5E4E0] sticky top-16 z-30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-row gap-2 items-center">
            <Pulse className="h-10 flex-1 rounded-xl" />
            <Pulse className="h-9 w-24 rounded-full" />
            <Pulse className="h-10 w-32 rounded-xl" />
          </div>

          {/* Food tag pills */}
          <div className="flex gap-2 mt-5">
            {Array.from({ length: 7 }).map((_, i) => (
              <Pulse key={i} className="h-7 w-16 rounded-full shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Store grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

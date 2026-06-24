function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className ?? ""}`} />;
}

export default function NewListingLoading() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#E5E4E0]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Pulse className="h-4 w-12" />
          <div className="w-px h-4 bg-gray-200" />
          <Pulse className="h-4 w-20" />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Images */}
        <div className="space-y-1.5">
          <Pulse className="h-4 w-24" />
          <Pulse className="h-32 w-full rounded-xl" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Pulse className="h-4 w-16" />
          <Pulse className="h-10 w-full rounded-md" />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Pulse className="h-4 w-24" />
          <Pulse className="h-24 w-full rounded-md" />
        </div>

        {/* Listing type */}
        <div className="space-y-1.5">
          <Pulse className="h-4 w-20" />
          <Pulse className="h-8 w-full rounded-lg" />
        </div>

        {/* Category + Condition (2 col) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Pulse className="h-4 w-20" />
            <Pulse className="h-8 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Pulse className="h-4 w-20" />
            <Pulse className="h-8 w-full rounded-lg" />
          </div>
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <Pulse className="h-4 w-12" />
          <Pulse className="h-10 w-full rounded-md" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Pulse className="h-10 w-20 rounded-md" />
          <Pulse className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}

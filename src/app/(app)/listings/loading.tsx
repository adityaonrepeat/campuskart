import { ListingGridSkeleton } from "@/components/listings/listing-skeleton";

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#F1F0EC] ${className ?? ""}`} />;
}

export default function ListingsLoading() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#E5E4E0] h-16" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
        <div className="flex gap-8">
          {/* Sidebar skeleton — desktop only */}
          <div className="listings-sidebar">
            <div className="bg-white rounded-2xl border border-[#E5E4E0] p-5 space-y-4">
              <Pulse className="h-4 w-24" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Pulse key={i} className="h-8 w-full rounded-xl" />
                ))}
              </div>
              <Pulse className="h-4 w-20 mt-4" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Pulse key={i} className="h-8 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="flex-1 min-w-0">
            {/* Search + Sort + Button row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <Pulse className="h-10 w-full rounded-[10px]" />
              <Pulse className="h-10 w-full rounded-[10px]" />
              <Pulse className="h-10 w-full rounded-xl" />
            </div>

            {/* Tabs */}
            <Pulse className="h-10 w-full rounded-xl mb-6" />

            {/* Grid */}
            <ListingGridSkeleton count={6} />
          </div>
        </div>
      </div>
    </div>
  );
}

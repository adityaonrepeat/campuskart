function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#F1F0EC] ${className ?? ""}`} />;
}

export default function ListingDetailLoading() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E4E0] h-16" />

      <div className="pt-20">
        {/* Breadcrumb bar */}
        <div className="bg-white border-b border-[#E5E4E0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2">
            <Pulse className="h-3 w-8" />
            <Pulse className="h-3 w-3 rounded-none" />
            <Pulse className="h-3 w-16" />
            <Pulse className="h-3 w-3 rounded-none" />
            <Pulse className="h-3 w-44" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

            {/* LEFT: image gallery */}
            <div>
              <Pulse className="w-full rounded-2xl mb-3" style={{ aspectRatio: "4/3" }} />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Pulse key={i} className="w-20 h-20 rounded-xl" />
                ))}
              </div>
            </div>

            {/* RIGHT: info */}
            <div className="flex flex-col gap-5">
              {/* Category + title */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pulse className="h-3.5 w-20" />
                  <Pulse className="h-3.5 w-28 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Pulse className="h-8 w-full" />
                  <Pulse className="h-8 w-3/4" />
                </div>
              </div>

              {/* Price card */}
              <div className="bg-white rounded-2xl border border-[#E5E4E0] p-5">
                <div className="flex items-end justify-between mb-5">
                  <div className="space-y-1.5">
                    <Pulse className="h-3 w-20" />
                    <Pulse className="h-10 w-28" />
                    <Pulse className="h-3 w-16" />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <Pulse className="h-3 w-16" />
                    <Pulse className="h-5 w-20" />
                    <Pulse className="h-3 w-14" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Pulse className="h-12 w-full rounded-xl" />
                  <Pulse className="h-12 w-full rounded-xl" />
                </div>
              </div>

              {/* Tabs card */}
              <div className="bg-white rounded-2xl border border-[#E5E4E0] overflow-hidden">
                <div className="flex border-b border-[#E5E4E0]">
                  <div className="flex-1 py-3 flex justify-center">
                    <Pulse className="h-4 w-16" />
                  </div>
                  <div className="w-px bg-[#E5E4E0]" />
                  <div className="flex-1 py-3 flex justify-center">
                    <Pulse className="h-4 w-12" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-1.5 mb-4">
                    <Pulse className="h-3.5 w-full" />
                    <Pulse className="h-3.5 w-5/6" />
                    <Pulse className="h-3.5 w-2/3" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-[#F8F7F4] rounded-xl p-3 space-y-1.5">
                        <Pulse className="h-2.5 w-14" />
                        <Pulse className="h-3.5 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

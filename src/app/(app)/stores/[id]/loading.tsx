function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#F1F0EC] ${className ?? ""}`} />;
}

export default function StoreDetailLoading() {
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
            <Pulse className="h-3 w-36" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

            {/* LEFT: gallery */}
            <div>
              <Pulse className="w-full rounded-2xl aspect-4/3" />
              <div className="flex gap-2 mt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Pulse key={i} className="w-16 h-16 rounded-xl" />
                ))}
              </div>
            </div>

            {/* RIGHT: info */}
            <div className="flex flex-col gap-5">
              {/* Category + college */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pulse className="h-3.5 w-20" />
                  <Pulse className="h-3.5 w-28 rounded-full" />
                </div>
                <Pulse className="h-8 w-2/3 mb-2" />
                {/* Stars */}
                <div className="flex items-center gap-1.5 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Pulse key={i} className="h-4 w-4 rounded-sm" />
                  ))}
                  <Pulse className="h-4 w-16 ml-1" />
                </div>
              </div>

              {/* Action card */}
              <div className="bg-white rounded-2xl border border-[#E5E4E0] p-5 space-y-4">
                <Pulse className="h-12 w-full rounded-xl" />
                <div className="flex gap-2">
                  <Pulse className="h-10 flex-1 rounded-xl" />
                  <Pulse className="h-10 flex-1 rounded-xl" />
                </div>
                <div className="space-y-3 pt-3 border-t border-[#E5E4E0]">
                  <div className="flex items-start gap-3">
                    <Pulse className="h-4 w-4 rounded-sm shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <Pulse className="h-3 w-10" />
                      <Pulse className="h-3.5 w-40" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Pulse className="h-4 w-4 rounded-sm shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <Pulse className="h-3 w-16" />
                      <Pulse className="h-3.5 w-52" />
                    </div>
                  </div>
                </div>
              </div>

              {/* About card */}
              <div className="bg-white rounded-2xl border border-[#E5E4E0] p-5 space-y-2">
                <Pulse className="h-3 w-12 mb-3" />
                <Pulse className="h-3.5 w-full" />
                <Pulse className="h-3.5 w-5/6" />
                <Pulse className="h-3.5 w-4/6" />
                <div className="flex gap-1.5 pt-2">
                  <Pulse className="h-6 w-16 rounded-full" />
                  <Pulse className="h-6 w-20 rounded-full" />
                  <Pulse className="h-6 w-14 rounded-full" />
                </div>
              </div>

              {/* Owner card */}
              <div className="bg-white rounded-2xl border border-[#E5E4E0] p-5">
                <Pulse className="h-3 w-24 mb-3" />
                <div className="flex items-center gap-3">
                  <Pulse className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="space-y-1.5">
                    <Pulse className="h-4 w-28" />
                    <Pulse className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews section */}
          <div className="mt-10">
            <Pulse className="h-6 w-24 mb-5" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E5E4E0] p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <Pulse className="w-9 h-9 rounded-xl shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Pulse className="h-3.5 w-28" />
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Pulse key={j} className="h-3 w-3 rounded-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Pulse className="h-3.5 w-full" />
                  <Pulse className="h-3.5 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

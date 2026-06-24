function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className ?? ''}`} />;
}

export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Hero card */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Content */}
          <div className="flex flex-col items-center gap-4">

            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-200 animate-pulse shrink-0" />

            {/* Info — centered */}
            <div className="flex flex-col items-center gap-2">
              <Pulse className="h-3.5 w-20" />
              <Pulse className="h-8 w-44" />
              <Pulse className="h-5 w-56 rounded-full" />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Pulse className="h-10 w-28 rounded-xl" />
              <Pulse className="h-10 w-28 rounded-xl" />
            </div>
          </div>

          {/* Stats bar: 4 tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-xl py-3 px-2 border border-border flex flex-col items-center gap-1.5">
                <Pulse className="h-7 w-8" />
                <Pulse className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Tab pill */}
        <Pulse className="h-10 w-44 rounded-xl mb-5" />

        {/* Listing grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden bg-white">
              <Pulse className="h-40 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Pulse className="h-4 w-3/4" />
                <Pulse className="h-4 w-1/2" />
                <div className="flex items-center justify-between pt-1">
                  <Pulse className="h-5 w-14" />
                  <Pulse className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

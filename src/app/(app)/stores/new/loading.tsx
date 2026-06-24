function PulseWhite({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/20 ${className ?? ""}`} />;
}

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className ?? ""}`} />;
}

export default function NewStoreLoading() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent-light blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {/* Back link */}
          <PulseWhite className="h-4 w-28 mb-5" />

          {/* Icon + title + description */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 shrink-0" />
            <div className="space-y-2 flex-1">
              <PulseWhite className="h-9 w-40" />
              <PulseWhite className="h-3 w-full max-w-md" />
              <PulseWhite className="h-3 w-3/4 max-w-sm" />
            </div>
          </div>

          {/* Chips */}
          <div className="flex gap-2 mt-5">
            <PulseWhite className="h-6 w-28 rounded-full" />
            <PulseWhite className="h-6 w-28 rounded-full" />
            <PulseWhite className="h-6 w-36 rounded-full" />
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 space-y-8">
          {/* Section: Basic info */}
          <div className="space-y-5">
            <Pulse className="h-5 w-28" />
            <div className="space-y-1.5">
              <Pulse className="h-4 w-24" />
              <Pulse className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Pulse className="h-4 w-24" />
              <Pulse className="h-20 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Pulse className="h-4 w-20" />
              <Pulse className="h-8 w-full rounded-lg" />
            </div>
          </div>

          {/* Section: Delivery */}
          <div className="space-y-3">
            <Pulse className="h-5 w-36" />
            <div className="flex gap-3">
              <Pulse className="h-10 flex-1 rounded-xl" />
              <Pulse className="h-10 flex-1 rounded-xl" />
              <Pulse className="h-10 flex-1 rounded-xl" />
            </div>
          </div>

          {/* Section: Images */}
          <div className="space-y-4">
            <Pulse className="h-5 w-32" />
            <Pulse className="h-28 w-full rounded-xl" />
          </div>

          {/* Section: Contact */}
          <div className="space-y-4">
            <Pulse className="h-5 w-28" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Pulse className="h-4 w-20" />
                <Pulse className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Pulse className="h-4 w-24" />
                <Pulse className="h-10 w-full rounded-md" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Pulse className="h-4 w-28" />
              <Pulse className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Pulse className="h-10 w-20 rounded-md" />
            <Pulse className="h-10 w-36 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/20 ${className ?? ''}`} />;
}

function PulseLight({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className ?? ''}`} />;
}

export default function ProfileEditLoading() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent-light blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {/* Back link placeholder */}
          <Pulse className="h-4 w-24 mb-5" />

          {/* Icon + title row */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 shrink-0" />
            <Pulse className="h-9 w-36 mt-1" />
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 space-y-6">
          {/* Display name */}
          <div className="space-y-1.5">
            <PulseLight className="h-4 w-24" />
            <PulseLight className="h-10 w-full rounded-md" />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <PulseLight className="h-4 w-20" />
            <PulseLight className="h-10 w-full rounded-md" />
            <PulseLight className="h-3 w-56" />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <PulseLight className="h-4 w-12" />
            <PulseLight className="h-20 w-full rounded-md" />
            <PulseLight className="h-3 w-32" />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <PulseLight className="h-10 w-20 rounded-md" />
            <PulseLight className="h-10 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

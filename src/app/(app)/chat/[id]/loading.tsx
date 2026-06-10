function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#F1F0EC] ${className ?? ""}`} />;
}

export default function ChatThreadLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 h-18 border-b border-border shrink-0">
        {/* Back arrow — mobile only */}
        <Pulse className="sm:hidden h-5 w-5 rounded shrink-0" />
        {/* Avatar */}
        <Pulse className="h-10 w-10 rounded-xl shrink-0" />
        {/* Name + status */}
        <div className="flex-1 space-y-2">
          <Pulse className="h-3.5 w-32" />
          <Pulse className="h-3 w-20" />
        </div>
        {/* Item chip — always visible when present */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8F7F4] border border-[#E5E4E0] shrink-0">
          <Pulse className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1">
            <Pulse className="h-2.5 w-6" />
            <Pulse className="h-3 w-28" />
          </div>
        </div>
        {/* View Listing link — desktop only */}
        <Pulse className="hidden sm:block h-3.5 w-20 shrink-0" />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Their message */}
        <div className="flex items-end gap-2">
          <Pulse className="h-8 w-8 rounded-xl shrink-0" />
          <Pulse className="h-10 w-52 rounded-2xl rounded-bl-sm" />
        </div>
        {/* My message */}
        <div className="flex justify-end">
          <Pulse className="h-10 w-40 rounded-2xl rounded-br-sm" />
        </div>
        {/* Their message (longer) */}
        <div className="flex items-end gap-2">
          <Pulse className="h-8 w-8 rounded-xl shrink-0" />
          <Pulse className="h-16 w-60 rounded-2xl rounded-bl-sm" />
        </div>
        {/* My message */}
        <div className="flex justify-end">
          <Pulse className="h-10 w-56 rounded-2xl rounded-br-sm" />
        </div>
        {/* Their message */}
        <div className="flex items-end gap-2">
          <Pulse className="h-8 w-8 rounded-xl shrink-0" />
          <Pulse className="h-10 w-44 rounded-2xl rounded-bl-sm" />
        </div>
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-border shrink-0">
        <Pulse className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

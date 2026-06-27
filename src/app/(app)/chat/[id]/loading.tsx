import { cn } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-[#F1F0EC]", className)} />;
}

export default function ChatThreadLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Thread header — mirrors chat/[id]/page.tsx (h-[72px], round avatar) */}
      <div className="flex items-center gap-3 px-4 h-18 border-b border-border shrink-0">
        {/* Back arrow: mobile only */}
        <Pulse className="sm:hidden h-5 w-5 rounded shrink-0" />
        {/* Avatar */}
        <Pulse className="h-10 w-10 rounded-full shrink-0" />
        {/* Name + status */}
        <div className="flex-1 space-y-2">
          <Pulse className="h-3.5 w-32" />
          <Pulse className="h-3 w-20" />
        </div>
        {/* Item chip: always visible when present */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border shrink-0">
          <Pulse className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1">
            <Pulse className="h-2.5 w-6" />
            <Pulse className="h-3 w-28" />
          </div>
        </div>
        {/* View Listing link: desktop only */}
        <Pulse className="hidden sm:block h-3.5 w-20 shrink-0" />
      </div>

      {/* Messages area — mirrors MessageList (flex flex-col gap-4 p-5) */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-5 min-h-0">
        {/* Their message */}
        <div className="flex items-end gap-2">
          <Pulse className="h-7 w-7 rounded-full shrink-0" />
          <Pulse className="h-10 w-52 rounded-2xl rounded-bl-sm" />
        </div>
        {/* My message */}
        <div className="flex justify-end">
          <Pulse className="h-10 w-40 rounded-2xl rounded-br-sm" />
        </div>
        {/* Their message (longer) */}
        <div className="flex items-end gap-2">
          <Pulse className="h-7 w-7 rounded-full shrink-0" />
          <Pulse className="h-16 w-60 rounded-2xl rounded-bl-sm" />
        </div>
        {/* My message */}
        <div className="flex justify-end">
          <Pulse className="h-10 w-56 rounded-2xl rounded-br-sm" />
        </div>
        {/* Their message */}
        <div className="flex items-end gap-2">
          <Pulse className="h-7 w-7 rounded-full shrink-0" />
          <Pulse className="h-10 w-44 rounded-2xl rounded-bl-sm" />
        </div>
      </div>

      {/* Input area — mirrors ChatInput (p-4, input + round send button) */}
      <div className="flex gap-2 items-end p-4 border-t border-border shrink-0">
        <Pulse className="h-12 flex-1 rounded-xl" />
        <Pulse className="w-11 h-11 rounded-full shrink-0" />
      </div>
    </div>
  );
}

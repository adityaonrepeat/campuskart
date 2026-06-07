"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef } from "react";

export function StoreSearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("search", value);
      else params.delete("search");
      router.replace(`${pathname}?${params.toString()}`);
    }, 350);
  }

  return (
    <div className="relative flex-1 min-w-0">
      <svg
        className="absolute left-3 top-[29%] -translate-y-1/2 text-muted-foreground pointer-events-none"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search stores, cuisines, dishes..."
        className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
      />
    </div>
  );
}

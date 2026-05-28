"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const tabs = [
    { label: "Listings", href: "/admin/listings" },
    ...(isAdmin ? [{ label: "Mod Log", href: "/admin/mod-log" }] : []),
  ];

  return (
    <div className="flex gap-1 border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
            pathname.startsWith(tab.href)
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

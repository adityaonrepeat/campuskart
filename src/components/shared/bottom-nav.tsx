"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { ConversationListItem } from "@/types/chat";

function useTotalUnread(): number {
  const { data } = useQuery({
    queryKey: ["conversations"],
    queryFn: async (): Promise<ConversationListItem[]> => {
      const res = await fetch("/api/conversations");
      if (!res.ok) return [];
      const json = (await res.json()) as
        | { success: true; data: ConversationListItem[] }
        | { success: false; error: string };
      return json.success ? json.data : [];
    },
    staleTime: 30_000,
    select: (data) => data.reduce((sum, c) => sum + c.unreadCount, 0),
  });
  return data ?? 0;
}

type NavItem = { href: string; label: string; icon: React.ReactNode; activeIcon: React.ReactNode };

const BASE_NAV_ITEMS: Omit<NavItem, "activeIcon">[] = [
  {
    href: "/listings",
    label: "Browse",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: "/stores",
    label: "Stores",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const ADMIN_ITEM = {
  href: "/admin/stores",
  label: "Admin",
  icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

export function BottomNav({ showAdmin = false }: { showAdmin?: boolean }) {
  const pathname = usePathname();
  const totalUnread = useTotalUnread();

  const navItems = showAdmin ? [...BASE_NAV_ITEMS, ADMIN_ITEM] : BASE_NAV_ITEMS;

  return (
    <nav className="bottom-nav-wrap fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
      <div className="bg-white/96 backdrop-blur-md border-t border-[#E5E4E0] shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
        <div className={cn("flex h-15.5 mx-auto px-1", showAdmin ? "max-w-lg" : "max-w-sm")}>
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            const isChat = href === "/chat";

            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center justify-center gap-1 relative group py-2"
              >
                {/* Icon */}
                <span className="relative">
                  <span
                    className={cn(
                      "transition-colors duration-200",
                      isActive
                        ? "text-[#4F46E5]"
                        : "text-[#9CA3AF] group-hover:text-[#6B7280]"
                    )}
                  >
                    {icon}
                  </span>
                  {isChat && totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-0.5 rounded-full bg-[#4F46E5] text-white text-[9px] flex items-center justify-center font-bold leading-none">
                      {totalUnread > 9 ? "9+" : totalUnread}
                    </span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-[#4F46E5]" : "text-[#9CA3AF] group-hover:text-[#6B7280]"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

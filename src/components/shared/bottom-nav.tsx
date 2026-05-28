"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, MessageSquare, ClipboardList, User, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
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

type NavItem = { href: string; label: string; icon: LucideIcon };

const BASE_NAV_ITEMS: NavItem[] = [
  { href: "/listings", label: "Browse", icon: ShoppingBag },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav({ showAdmin = false }: { showAdmin?: boolean }) {
  const pathname = usePathname();
  const totalUnread = useTotalUnread();

  const navItems: NavItem[] = showAdmin
    ? [...BASE_NAV_ITEMS, { href: "/admin/listings", label: "Admin", icon: ShieldCheck }]
    : BASE_NAV_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm safe-area-pb">
      <div className="flex h-16 max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          const isChat = href === "/chat";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {isChat && totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold leading-none">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

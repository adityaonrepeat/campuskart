import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StoreGrid } from "@/components/stores/store-grid";
import { StoreSearchInput } from "@/components/stores/store-search-input";
import AppHeader from "@/components/AppHeader";
import { canModerate } from "@/lib/permissions";

const FOOD_TAGS = [
  { label: "All", value: "" },
  { label: "Cafe", value: "Cafe" },
  { label: "Biryani", value: "Biryani" },
  { label: "Cake", value: "Cake" },
  { label: "Dosa", value: "Dosa" },
  { label: "Chicken", value: "Chicken" },
  { label: "Noodles", value: "Noodles" },
  { label: "Pizza", value: "Pizza" },
];

interface PageProps {
  searchParams: Promise<{ tag?: string; search?: string; open?: string }>;
}

export default async function StoresPage({ searchParams }: PageProps) {
  const { tag, search, open } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const ownStore = userId
    ? await db.store.findUnique({ where: { ownerId: userId }, select: { id: true } })
    : null;

  return (
    <div>
      <AppHeader user={{ name: session?.user.name ?? "User", avatarUrl: session?.user.avatarUrl }} forceScrolled showAdmin={session ? canModerate(session.user) : false} />

      {/* Search + filters bar */}
      <div className="bg-white border-b border-border sticky top-16 z-30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-row gap-2 items-center">
            <StoreSearchInput defaultValue={search} />

            {/* Open Now toggle */}
            <Link
              href={
                open === "1"
                  ? `/stores${search ? `?search=${search}` : ""}${tag ? `${search ? "&" : "?"}tag=${tag}` : ""}`
                  : `/stores?open=1${search ? `&search=${search}` : ""}${tag ? `&tag=${tag}` : ""}`
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors shrink-0 ${
                open === "1"
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-surface border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${open === "1" ? "bg-green-500" : "bg-gray-300"}`} />
              Open Now
            </Link>

            {!ownStore ? (
              <Link
                href="/stores/new"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                List your store
              </Link>
            ) : (
              <Link
                href={`/stores/${ownStore.id}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:border-accent/40 transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                My store
              </Link>
            )}
          </div>

          {/* Food tag pills */}
          <div className="flex gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
            {FOOD_TAGS.map((t) => {
              const isActive = (tag ?? "") === t.value;
              const href = t.value
                ? `/stores?tag=${encodeURIComponent(t.value)}${search ? `&search=${search}` : ""}${open === "1" ? "&open=1" : ""}`
                : `/stores${search ? `?search=${search}` : ""}${open === "1" ? `${search ? "&" : "?"}open=1` : ""}`;
              return (
                <Link
                  key={t.value}
                  href={href}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-accent text-white"
                      : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Store grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <StoreGrid filters={{ tag, search }} openOnly={open === "1"} />
      </div>
    </div>
  );
}

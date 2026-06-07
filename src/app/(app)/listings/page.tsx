import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import ListingsGrid from "@/components/listings/ListingsGrid";
import { FilterSidebar } from "@/components/listings/filter-sidebar";
import AppHeader from "@/components/AppHeader";
import type { ListingFilters } from "@/types/listing";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    condition?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: string;
  }>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const { category, search, condition, priceMin, priceMax, sort } =
    await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  const filters: ListingFilters = {
    category,
    search,
    condition,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    sort,
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <AppHeader user={{ name: session?.user.name ?? "User", avatarUrl: session?.user.avatarUrl }} forceScrolled showAdmin={session?.user.role === "MODERATOR" || session?.user.role === "ADMIN"} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
        <div className="flex gap-8">
          <div className="listings-sidebar">
            <FilterSidebar />
          </div>
          <div className="flex-1 min-w-0">
            <ListingsGrid filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}

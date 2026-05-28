import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ListingGrid } from "@/components/listings/listing-grid";
import { ListingSearch } from "@/components/listings/listing-search";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const { category, search } = await searchParams;

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Browse listings</h1>
        <Link href="/listings/new" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="h-4 w-4 mr-1" />
          Sell
        </Link>
      </div>

      <ListingSearch />

      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {[
            { label: "All", value: "" },
            { label: "Books", value: "BOOKS" },
            { label: "Electronics", value: "ELECTRONICS" },
            { label: "Clothing", value: "CLOTHING" },
            { label: "Furniture", value: "FURNITURE" },
            { label: "Notes", value: "NOTES" },
            { label: "Sports", value: "SPORTS" },
            { label: "Other", value: "OTHER" },
          ].map((cat) => {
            const isActive = (category ?? "") === cat.value;
            const href = cat.value
              ? `/listings?category=${cat.value}${search ? `&search=${search}` : ""}`
              : `/listings${search ? `?search=${search}` : ""}`;
            return (
              <Link
                key={cat.value}
                href={href}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </div>

      <ListingGrid filters={{ category, search }} />
    </div>
  );
}

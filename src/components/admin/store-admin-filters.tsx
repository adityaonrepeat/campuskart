"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Search } from "lucide-react";

interface StoreAdminFiltersProps {
  isAdmin: boolean;
  colleges: { id: string; name: string }[];
  defaultValues: { search?: string; college?: string; status?: string };
}

export function StoreAdminFilters({ isAdmin, colleges, defaultValues }: StoreAdminFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(defaultValues.search ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/admin/stores?${params.toString()}`);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setSearch(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("search", q.trim()), 300);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-[29%] -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search stores by name..."
          className="w-full rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors placeholder:text-muted-foreground"
        />
      </div>

      <select
        defaultValue={defaultValues.status ?? "ALL"}
        onChange={(e) => updateParam("status", e.target.value === "ALL" ? "" : e.target.value)}
        className="rounded-lg border border-border bg-white pl-3 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
      >
        <option value="ALL">All</option>
        <option value="PENDING">Pending</option>
        <option value="ACTIVE">Active</option>
        {isAdmin && <option value="ARCHIVED">Archived</option>}
      </select>

      {isAdmin && colleges.length > 0 && (
        <select
          defaultValue={defaultValues.college ?? ""}
          onChange={(e) => updateParam("college", e.target.value)}
          className="rounded-lg border border-border bg-white pl-3 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">All colleges</option>
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

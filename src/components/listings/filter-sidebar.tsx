"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Textbooks", value: "BOOKS" },
  { label: "Electronics", value: "ELECTRONICS" },
  { label: "Sports & Fitness", value: "SPORTS" },
  { label: "Clothing", value: "CLOTHING" },
  { label: "Notes", value: "NOTES" },
  { label: "Furniture", value: "FURNITURE" },
  { label: "Other", value: "OTHER" },
];

const CONDITIONS = [
  { label: "Any", value: "" },
  { label: "New", value: "NEW" },
  { label: "Like New", value: "LIKE_NEW" },
  { label: "Good", value: "GOOD" },
  { label: "Fair", value: "FAIR" },
];

const MAX_PRICE = 50000;

interface FilterSidebarProps {
  onClose?: () => void;
}

export function FilterSidebar({ onClose }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [condition, setCondition] = useState(searchParams.get("condition") ?? "");
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "0");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? String(MAX_PRICE));

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set("category", category); else params.delete("category");
    if (condition) params.set("condition", condition); else params.delete("condition");
    const min = Number(priceMin);
    const max = Number(priceMax);
    if (min > 0) params.set("priceMin", String(min)); else params.delete("priceMin");
    if (max < MAX_PRICE) params.set("priceMax", String(max)); else params.delete("priceMax");
    params.delete("cursor");
    startTransition(() => router.push(`/listings?${params.toString()}`));
    onClose?.();
  }

  function resetFilters() {
    setCategory("");
    setCondition("");
    setPriceMin("0");
    setPriceMax(String(MAX_PRICE));
    startTransition(() => router.push("/listings"));
    onClose?.();
  }

  return (
    <aside className="bg-white rounded-2xl border border-(--ck-border) p-6 h-fit sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-[#111111] text-base">Filters</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="text-xs text-[#4F46E5] hover:underline font-medium"
          >
            Reset
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-[#6B7280] hover:text-[#111111] ml-2"
              aria-label="Close filters"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="filter-section">
        <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-3">Category</h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                category === cat.value
                  ? "bg-[#EEF2FF] text-[#4F46E5] font-semibold"
                  : "text-[#6B7280] hover:bg-[#F8F7F4] hover:text-[#111111]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-3">Price Range</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <label className="text-[10px] text-[#6B7280] mb-1 block">Min</label>
            <div className="relative">
              <span className="absolute left-3 text-[#6B7280] text-xs" style={{ top: '50%', transform: 'translateY(-50%)', lineHeight: 1 }}>₹</span>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="input-field text-sm"
                style={{ paddingLeft: '1.75rem', paddingTop: '8px', paddingBottom: '8px' }}
                min={0}
                max={Number(priceMax)}
                placeholder="0"
              />
            </div>
          </div>
          <span className="text-[#6B7280] text-xs mt-5">—</span>
          <div className="flex-1">
            <label className="text-[10px] text-[#6B7280] mb-1 block">Max</label>
            <div className="relative">
              <span className="absolute left-3 text-[#6B7280] text-xs" style={{ top: '50%', transform: 'translateY(-50%)', lineHeight: 1 }}>₹</span>
              <input
                type="number"
                value={priceMax === String(MAX_PRICE) ? "" : priceMax}
                onChange={(e) => setPriceMax(e.target.value || String(MAX_PRICE))}
                className="input-field text-sm"
                style={{ paddingLeft: '1.75rem', paddingTop: '8px', paddingBottom: '8px' }}
                min={Number(priceMin)}
                placeholder="Any"
              />
            </div>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          value={Number(priceMax)}
          onChange={(e) => setPriceMax(e.target.value)}
          className="w-full accent-[#4F46E5]"
        />
        <div className="flex justify-between text-[10px] text-[#6B7280] mt-1">
          <span>₹0</span>
          <span>₹50,000+</span>
        </div>
      </div>

      {/* Condition */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-3">Condition</h3>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((cond) => (
            <button
              key={cond.value}
              onClick={() => setCondition(cond.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                condition === cond.value
                  ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                  : "bg-white text-[#6B7280] border-(--ck-border) hover:border-[rgba(79,70,229,0.4)] hover:text-[#4F46E5]"
              }`}
            >
              {cond.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={applyFilters}
        className="w-full bg-accent text-white font-semibold py-3 rounded-xl text-sm hover:bg-accent/90 transition-colors duration-200"
      >
        Apply Filters
      </button>
    </aside>
  );
}

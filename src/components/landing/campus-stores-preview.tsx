"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const PREVIEW_STORES = [
  {
    name: "The Campus Grind",
    type: "Café & Beverages",
    rating: 4.7,
    reviews: 84,
    featured: ["Cold Brew", "Matcha Latte", "Avocado Toast"],
    badge: "Popular",
    badgeColor: "bg-amber-100 text-amber-700",
    emoji: "☕",
    bg: "from-amber-50 to-orange-50",
  },
  {
    name: "StudyFuel Kitchen",
    type: "Meals & Bowls",
    rating: 4.9,
    reviews: 112,
    featured: ["Grain Bowl", "Protein Wrap", "Smoothie"],
    badge: "Top Rated",
    badgeColor: "bg-emerald-100 text-emerald-700",
    emoji: "🥗",
    bg: "from-emerald-50 to-teal-50",
  },
  {
    name: "Dorm Essentials Co.",
    type: "Stationery & Supplies",
    rating: 4.5,
    reviews: 47,
    featured: ["Notebooks", "Highlighters", "USB Hubs"],
    badge: "New",
    badgeColor: "bg-blue-100 text-blue-700",
    emoji: "📚",
    bg: "from-blue-50 to-indigo-50",
  },
];

export function CampusStoresPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); });
      },
      { threshold: 0.08 }
    );
    sectionRef.current?.querySelectorAll(".aos-elem").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="campus-stores" ref={sectionRef} className="py-24 bg-white border-b border-[#E5E4E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="aos-elem">
            <span className="text-indigo-600 text-xs font-semibold tracking-[0.2em] uppercase block mb-3">
              Campus Stores
            </span>
            <h2
              className="text-4xl sm:text-5xl font-semibold text-[#1A1A2E] leading-tight"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              Not just students —<br />
              <span className="italic font-normal">campus businesses too.</span>
            </h2>
          </div>
          <div className="aos-elem delay-200">
            <p className="text-[#6B7280] text-sm leading-relaxed max-w-xs border-l-2 border-[#E5E4E0] pl-4">
              Campus cafés, restaurants, and stores can register to reach students directly — verified, rated, and mapped.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {PREVIEW_STORES.map((store, i) => (
            <div key={store.name} className={`aos-elem delay-${(i + 1) * 100} listing-card`}>
              {/* Image placeholder */}
              <div className={`relative h-44 bg-gradient-to-br ${store.bg} flex items-center justify-center`}>
                <span className="text-6xl">{store.emoji}</span>
                <span className={`absolute top-3 left-3 tag-pill text-[10px] ${store.badgeColor}`}>
                  {store.badge}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-[#111111] text-base">{store.name}</h3>
                    <p className="text-[#6B7280] text-xs mt-0.5">{store.type}</p>
                  </div>
                  <span className="verified-badge flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Verified
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-[#111111]">{store.rating}</span>
                  <span className="text-xs text-[#6B7280]">({store.reviews} reviews)</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {store.featured.map((item) => (
                    <span key={item} className="tag-pill bg-[#F8F7F4] text-[#6B7280] border border-[#E5E4E0] text-[10px]">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="block w-full text-center border border-indigo-200 text-indigo-600 text-xs font-semibold py-2.5 rounded-xl">
                  View Store
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Register CTA */}
        <div className="aos-elem delay-400 bg-[#1A1A2E] rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3
              className="text-2xl sm:text-3xl font-semibold text-white mb-2"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              Own a campus business?
            </h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              Register your café, restaurant, or store on CampusKart and reach thousands of students at your college — with your location, menu, hours, and ratings all in one place.
            </p>
          </div>
          <Link
            href="/register"
            className="flex-shrink-0 bg-white text-[#1A1A2E] text-sm font-semibold px-7 py-3.5 rounded-xl hover:bg-[#F8F7F4] transition-colors duration-200 shadow-md whitespace-nowrap"
          >
            Register Your Store
          </Link>
        </div>
      </div>
    </section>
  );
}

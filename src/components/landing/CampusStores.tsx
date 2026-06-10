'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const STORES = [
  {
    id: 1,
    name: "The Campus Grind",
    type: "Café & Beverages",
    image: "/campus-stores.png",
    alt: 'Warm cozy campus café with coffee cups, wooden furniture, bright natural light streaming in',
    rating: 4.7,
    reviews: 84,
    college: 'IIT Bombay',
    items: 24,
    featured: ['Cold Brew', 'Matcha Latte', 'Avocado Toast'],
    badge: 'Popular',
    badgeColor: 'bg-amber-100 text-amber-700'
  },
  {
    id: 2,
    name: "StudyFuel Kitchen",
    type: "Meals & Bowls",
    image: "https://images.unsplash.com/photo-1604908815567-c9727d53f92a",
    alt: 'Colorful healthy grain bowls with fresh vegetables on clean white table, bright studio lighting',
    rating: 4.9,
    reviews: 112,
    college: 'BITS Pilani',
    items: 18,
    featured: ['Grain Bowl', 'Protein Wrap', 'Smoothie'],
    badge: 'Top Rated',
    badgeColor: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 3,
    name: "Dorm Essentials Co.",
    type: "Stationery & Supplies",
    image: "https://images.unsplash.com/photo-1496128858413-b36217c2ce36",
    alt: 'Neatly arranged stationery, notebooks, pens on bright desk, clean minimal product display',
    rating: 4.5,
    reviews: 47,
    college: 'IIT Delhi',
    items: 63,
    featured: ['Notebooks', 'Highlighters', 'USB Hubs'],
    badge: 'New',
    badgeColor: 'bg-blue-100 text-blue-700'
  }];


export default function CampusStores() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.08 }
    );
    sectionRef?.current?.querySelectorAll('.aos-elem')?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <section id="campus-stores" ref={sectionRef} className="py-24 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="section-header-row mb-12">
          <div className="aos-elem">
            <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase block mb-3">Campus Stores</span>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-primary leading-tight">
              Not just students —<br />
              <span className="italic font-normal">campus businesses too.</span>
            </h2>
          </div>
          <div className="aos-elem delay-200">
            <p className="text-muted text-sm leading-relaxed max-w-xs border-l-2 border-border pl-4">
              Campus cafés, restaurants, and stores can register to reach students directly on CampusKart.
            </p>
          </div>
        </div>

        {/* Store Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {STORES?.map((store, i) =>
            <div key={store?.id} className={`aos-elem delay-${(i + 1) * 100} listing-card`}>
              {/* Image */}
              <div className="img-zoom relative h-44">
                <AppImage
                  src={store?.image}
                  alt={store?.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw" />

                <span className={`absolute top-3 left-3 tag-pill text-[10px] ${store?.badgeColor}`}>
                  {store?.badge}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{store?.name}</h3>
                    <p className="text-muted text-xs mt-0.5">{store?.type}</p>
                  </div>
                  <span className="verified-badge flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {store?.college}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-foreground">{store?.rating}</span>
                  <span className="text-xs text-muted">({store?.reviews} reviews)</span>
                  <span className="text-xs text-muted ml-auto">{store?.items} items</span>
                </div>

                {/* Featured items */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {store?.featured?.map((item) =>
                    <span key={item} className="tag-pill bg-surface text-muted border border-border text-[10px]">{item}</span>
                  )}
                </div>

                <Link
                  href="/listings"
                  className="block w-full text-center border border-accent text-accent text-xs font-semibold py-2.5 rounded-xl hover:bg-accent hover:text-white transition-all duration-200">

                  View Store
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Register Store CTA */}
        <div className="aos-elem delay-400 bg-primary rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-inter)" }}>
              Own a campus business?
            </h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              Register your café, restaurant, or store on CampusKart and reach thousands of verified students at your college — no delivery needed, just campus pickup.
            </p>
          </div>
          <Link
            href="/signup"
            className="flex-shrink-0 bg-white text-primary text-sm font-semibold px-7 py-3.5 rounded-xl hover:bg-surface transition-colors duration-200 shadow-card whitespace-nowrap">
            Register Your Store
          </Link>
        </div>
      </div>
    </section>);

}
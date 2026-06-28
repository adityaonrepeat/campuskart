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
              Not just students<br />
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
        <div className="aos-elem delay-400 bg-primary rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-accent/10 via-transparent to-transparent pointer-events-none rounded-3xl" />
          <div className="relative z-10 px-8 py-16 sm:py-20 flex flex-col items-center text-center gap-7">

            <div className="max-w-xl">
              <h3 className="font-display text-4xl sm:text-5xl font-semibold text-white mb-4 leading-tight">
                Your campus,<br />
                <span className="italic font-normal">your customers.</span>
              </h3>
              <p className="text-white/55 text-sm sm:text-base leading-relaxed">
                List your café, store, or service and connect directly with thousands of verified students at your college.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 bg-white text-primary text-sm font-semibold px-6 py-3.5 rounded-xl hover:bg-surface transition-colors duration-200 shadow-card">
                Register Your Store
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/stores"
                className="flex items-center justify-center bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-colors duration-200">
                Browse Stores
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {["0% fees", "Live in 5 min", "Verified stores only"].map((stat, i) => (
                <React.Fragment key={stat}>
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />}
                  <span className="text-white/40 text-xs">{stat}</span>
                </React.Fragment>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>);

}
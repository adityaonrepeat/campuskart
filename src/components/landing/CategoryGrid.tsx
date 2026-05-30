'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

// Bento Row Audit (3-col grid):
// Row 1: [Textbooks col-span-1] + [Electronics col-span-1] + [Sports & Fitness col-span-1] = 3/3 ✓
// Row 2: [Clothing & Accessories col-span-2] + [Food & Essentials col-span-1] = 3/3 ✓

const CATEGORIES = [
{
  id: 'textbooks',
  label: 'Textbooks',
  count: '1,240 listings',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_12fda727c-1773019752595.png",
  alt: 'Stack of open textbooks on wooden desk, warm natural light, clean study environment',
  colSpan: 'col-span-1',
  rowSpan: '',
  height: 'h-52',
  accent: '#4F46E5'
},
{
  id: 'electronics',
  label: 'Electronics',
  count: '892 listings',
  image: "https://images.unsplash.com/photo-1639506060056-4d08c5ed6024",
  alt: 'Laptop and gadgets on clean white desk, minimal tech setup, bright ambient light',
  colSpan: 'col-span-1',
  rowSpan: '',
  height: 'h-52',
  accent: '#6366F1'
},
{
  id: 'sports',
  label: 'Sports & Fitness',
  count: '430 listings',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ea01c0dc-1767781048941.png",
  alt: 'Sports equipment including badminton rackets, yoga mat, and water bottles on gym floor',
  colSpan: 'col-span-1',
  rowSpan: '',
  height: 'h-52',
  accent: '#818CF8'
},
{
  id: 'clothing',
  label: 'Clothing & Accessories',
  count: '2,100 listings',
  image: "https://images.unsplash.com/photo-1522897355400-c4fdec73d979",
  alt: 'Neatly folded college sweatshirts and accessories on bright white surface, airy daylight',
  colSpan: 'col-span-1 sm:col-span-2',
  rowSpan: '',
  height: 'h-52',
  accent: '#A5B4FC'
},
{
  id: 'food',
  label: 'Food & Essentials',
  count: '310 listings',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1437ed157-1769242797089.png",
  alt: 'Fresh food bowls and healthy snacks on bright table, vibrant colors, well-lit cafeteria setting',
  colSpan: 'col-span-1',
  rowSpan: '',
  height: 'h-52',
  accent: '#C7D2FE'
}];


export default function CategoryGrid() {
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
    <section ref={sectionRef} className="py-24 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="section-header-row mb-12">
          <div className="aos-elem">
            <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase block mb-3">Browse By Category</span>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-primary leading-tight">
              Everything your campus<br />
              <span className="italic font-normal">needs, listed here.</span>
            </h2>
          </div>
          <Link href="/listings" className="aos-elem delay-200 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all duration-300">
            View all listings
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORIES?.map((cat, i) =>
          <Link
            key={cat?.id}
            href="/listings"
            className={`${cat?.colSpan} aos-elem delay-${(i + 1) * 100} img-zoom group relative ${cat?.height} rounded-2xl overflow-hidden border border-border cursor-pointer`}>
            
              <AppImage
              src={cat?.image}
              alt={cat?.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
            
              {/* Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent z-[1]" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 z-[2] p-5 flex items-end justify-between">
                <div>
                  <h3 className="text-white font-semibold text-base sm:text-lg leading-tight">{cat?.label}</h3>
                  <p className="text-white/60 text-xs mt-1">{cat?.count}</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-accent transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>);

}
'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const LISTINGS = [
{
  id: 1,
  title: 'Organic Chemistry Textbook (9th Ed.)',
  category: 'Textbooks',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_187f85c94-1772782290418.png",
  alt: 'Organic chemistry textbook open on clean white desk, well-lit study space',
  currentBid: 22,
  minBid: 15,
  seller: 'Priya M.',
  sellerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_187f85c94-1772782290418.png",
  rating: 4.8,
  reviews: 12,
  timeLeft: '2h 14m',
  bids: 5,
  condition: 'Good',
  college: 'UMich'
},
{
  id: 2,
  title: 'Yonex Badminton Racket',
  category: 'Sports & Fitness',
  image: "https://images.unsplash.com/photo-1733141731756-2d817614a15f",
  alt: 'Badminton racket on gym floor with shuttlecock, bright indoor lighting',
  currentBid: 28,
  minBid: 20,
  seller: 'Marcus T.',
  sellerAvatar: "https://images.unsplash.com/photo-1733141731756-2d817614a15f",
  rating: 4.6,
  reviews: 8,
  timeLeft: '5h 32m',
  bids: 3,
  condition: 'Like New',
  college: 'UCLA'
},
{
  id: 3,
  title: 'MacBook Pro 13" Charger (USB-C)',
  category: 'Electronics',
  image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0",
  alt: 'MacBook charger cable on clean white surface, minimal tech product photo',
  currentBid: 18,
  minBid: 12,
  seller: 'Jordan K.',
  sellerAvatar: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0",
  rating: 5.0,
  reviews: 21,
  timeLeft: '1h 08m',
  bids: 9,
  condition: 'Like New',
  college: 'NYU'
},
{
  id: 4,
  title: 'Lululemon Yoga Mat (6mm)',
  category: 'Sports & Fitness',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_18230b674-1765179770198.png",
  alt: 'Purple yoga mat rolled out on light wood floor, bright airy studio space',
  currentBid: 14,
  minBid: 10,
  seller: 'Aisha N.',
  sellerAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_18230b674-1765179770198.png",
  rating: 4.9,
  reviews: 6,
  timeLeft: '12h 00m',
  bids: 2,
  condition: 'Good',
  college: 'BU'
}];


function StarRating({ rating }: {rating: number;}) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) =>
      <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#F59E0B' : '#D1D5DB'} stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      <span className="text-muted text-[10px] ml-1">{rating}</span>
    </span>);

}

export default function FeaturedListings() {
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
    sectionRef.current?.querySelectorAll('.aos-elem').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="section-header-row mb-12">
          <div className="aos-elem">
            <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase block mb-3">Live Listings</span>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-primary leading-tight">
              Bids closing<br />
              <span className="italic font-normal">right now.</span>
            </h2>
          </div>
          <Link href="/listings" className="aos-elem delay-200 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all duration-300">
            See all listings
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LISTINGS.map((item, i) =>
          <div key={item.id} className={`aos-elem delay-${(i + 1) * 100} listing-card`}>
              {/* Image */}
              <div className="img-zoom relative h-44">
                <AppImage
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              
                {/* Condition badge */}
                <span className={`absolute top-3 left-3 tag-pill text-[10px] ${
              item.condition === 'Like New' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`
              }>
                  {item.condition}
                </span>
                {/* Category */}
                <span className="absolute top-3 right-3 tag-pill bg-black/40 text-white text-[10px] backdrop-blur-sm">
                  {item.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-sm leading-snug mb-3 line-clamp-2">{item.title}</h3>

                {/* Seller */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-border">
                    <AppImage src={item.sellerAvatar} alt={`${item.seller} profile photo`} width={24} height={24} className="object-cover" />
                  </div>
                  <span className="text-xs text-muted">{item.seller}</span>
                  <StarRating rating={item.rating} />
                </div>

                {/* College */}
                <div className="flex items-center gap-1 mb-3">
                  <span className="verified-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {item.college}
                  </span>
                </div>

                {/* Bid info */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Current Bid</p>
                    <p className="text-xl font-display font-semibold text-accent">${item.currentBid}</p>
                    <p className="text-[10px] text-muted">Min: ${item.minBid} · {item.bids} bids</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Ends In</p>
                    <p className="text-sm font-semibold text-foreground bid-pulse">{item.timeLeft}</p>
                  </div>
                </div>

                {/* CTA */}
                <Link
                href="/listings"
                className="block w-full text-center bg-accent text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-accent/90 transition-colors duration-200">
                
                  Place Bid
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
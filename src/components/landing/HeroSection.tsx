'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const COLLEGES = [
'Select your college...',
'University of Michigan',
'UCLA',
'NYU',
'Boston University',
'University of Texas',
'Georgia Tech',
'Ohio State University',
'University of Washington'];


const LIVE_BIDS = [
{ item: 'Calculus Textbook', bid: '$18', college: 'UMich' },
{ item: 'Badminton Racket', bid: '$24', college: 'UCLA' },
{ item: 'MacBook Charger', bid: '$15', college: 'NYU' },
{ item: 'Yoga Mat', bid: '$12', college: 'BU' },
{ item: 'Mini Fridge', bid: '$55', college: 'GT' }];


export default function HeroSection() {
  const [college, setCollege] = useState('');
  const [tickerIdx, setTickerIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIdx((i) => (i + 1) % LIVE_BIDS?.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (heroRef?.current) {
        setParallaxY(window.scrollY * 0.35);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const current = LIVE_BIDS?.[tickerIdx];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-end overflow-hidden grain-overlay"
      style={{ minHeight: '100vh' }}>
      
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${parallaxY}px)`, willChange: 'transform' }}>
        
        <AppImage
          src="https://img.rocket.new/generatedImages/rocket_gen_img_1a512b40c-1774988726905.png"
          alt="Students on a vibrant college campus lawn, warm afternoon light, busy walkways, lush green trees, airy open space"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw" />
        
      </div>
      {/* Gradient Scrim — dark at bottom for white text */}
      <div className="absolute inset-0 z-[1]" style={{
        background: 'linear-gradient(to bottom, rgba(26,26,46,0.55) 0%, rgba(26,26,46,0.25) 40%, rgba(26,26,46,0.80) 100%)'
      }} />
      {/* Live Bid Ticker — top bar */}
      <div className="absolute top-20 left-0 right-0 z-10 flex justify-center pt-4 px-4">
        <div className="glass rounded-full px-4 py-2 flex items-center gap-3 max-w-xs sm:max-w-sm">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="ping-dot absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-white/90 text-xs font-medium truncate">
            Live bid: <span className="text-white font-semibold">{current?.item}</span> — {current?.bid} at {current?.college}
          </span>
        </div>
      </div>
      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 pt-32 sm:pb-24">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <span className="tag-pill bg-white/10 text-white/90 backdrop-blur-sm border border-white/20 text-xs tracking-widest uppercase">
              Campus-Exclusive Marketplace
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.95] font-semibold text-white mb-6 tracking-tight">
            Your campus.<br />
            <span className="italic font-normal text-accent-light">Your marketplace.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-white/75 text-lg sm:text-xl font-light leading-relaxed mb-10 max-w-xl">
            List items, place bids, and connect with verified students at your college. Textbooks, gear, food — all picked up on campus.
          </p>

          {/* College Selector + CTA */}
          <div className="hero-cta-row">
            <div className="relative flex-1">
              <select
                value={college}
                onChange={(e) => setCollege(e?.target?.value)}
                className="w-full bg-white/95 text-foreground text-sm font-medium rounded-xl px-4 py-3.5 outline-none border-none appearance-none cursor-pointer pr-10 shadow-lg"
                style={{ fontFamily: 'var(--font-body)' }}>
                
                {COLLEGES?.map((c) =>
                <option key={c} value={c === 'Select your college...' ? '' : c}>{c}</option>
                )}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <Link
              href="/listings"
              className="btn-shimmer text-white font-semibold px-7 py-3.5 rounded-xl shadow-accent-md whitespace-nowrap text-sm hover:shadow-accent-lg transition-shadow duration-300 text-center">
              
              Browse Listings
            </Link>
          </div>

          {/* Secondary CTA */}
          <div className="flex items-center gap-6">
            <Link
              href="/sign-up-login"
              className="text-white/80 text-sm font-medium hover:text-white transition-colors flex items-center gap-2 group">
              
              <span className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
              List your first item free
            </Link>
            <span className="text-white/30">·</span>
            <span className="text-white/60 text-sm">No fees to join</span>
          </div>
        </div>

      </div>

      {/* Floating Stats Card — positioned relative to section */}
      <div className="hero-stats-card">
        <div className="glass-dark rounded-2xl p-5 w-56 float-anim">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Live Stats</span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-white text-2xl font-display font-semibold">4,820</p>
              <p className="text-white/50 text-xs">active listings</p>
            </div>
            <div className="h-px bg-white/10" />
            <div>
              <p className="text-white text-2xl font-display font-semibold">128</p>
              <p className="text-white/50 text-xs">bids in last hour</p>
            </div>
          </div>
        </div>
      </div>
      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase">Scroll</span>
        <div className="w-px h-10 bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full bg-white/60" style={{ height: '40%', animation: 'scroll-indicator 2s ease-in-out infinite' }} />
        </div>
      </div>
      <style>{`
        @keyframes scroll-indicator {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
      `}</style>
    </section>);

}
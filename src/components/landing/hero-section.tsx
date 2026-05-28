"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const ACTIVITY = [
  { item: "Engineering Mathematics", price: "₹350", college: "IIT Delhi" },
  { item: "JBL Earphones", price: "₹800", college: "NIT Trichy" },
  { item: "Casio FX-991", price: "₹200", college: "BITS Pilani" },
  { item: "Cricket Bat (SG)", price: "₹1,200", college: "VIT Vellore" },
  { item: "Mini Table Fan", price: "₹150", college: "DU North Campus" },
];

export function HeroSection() {
  const [idx, setIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % ACTIVITY.length), 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) setParallaxY(window.scrollY * 0.25);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current = ACTIVITY[idx];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-end overflow-hidden grain-overlay"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          transform: `translateY(${parallaxY}px)`,
          willChange: "transform",
          background:
            "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #1e1b4b 100%)",
        }}
      />
      {/* Decorative blobs */}
      <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-10 z-0"
        style={{ background: "radial-gradient(circle, #818CF8, transparent 70%)" }} />
      <div className="absolute bottom-32 left-10 w-72 h-72 rounded-full opacity-10 z-0"
        style={{ background: "radial-gradient(circle, #4F46E5, transparent 70%)" }} />

      {/* Gradient scrim */}
      <div className="absolute inset-0 z-[1]"
        style={{ background: "linear-gradient(to bottom, rgba(26,26,46,0.3) 0%, transparent 40%, rgba(26,26,46,0.85) 100%)" }} />

      {/* Live ticker */}
      <div className="absolute top-20 left-0 right-0 z-10 flex justify-center pt-4 px-4">
        <div className="glass rounded-full px-4 py-2 flex items-center gap-3 max-w-xs sm:max-w-sm">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="ping-dot absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-white/90 text-xs font-medium truncate">
            Just listed: <span className="text-white font-semibold">{current.item}</span>{" "}
            — {current.price} · {current.college}
          </span>
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 pt-32 sm:pb-24">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="tag-pill bg-white/10 text-white/90 backdrop-blur-sm border border-white/20 text-xs tracking-widest uppercase">
              Campus-Exclusive Marketplace
            </span>
          </div>

          <h1
            className="text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.95] font-semibold text-white mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            Your campus.<br />
            <span className="italic font-normal text-indigo-300">Your marketplace.</span>
          </h1>

          <p className="text-white/75 text-lg sm:text-xl font-light leading-relaxed mb-10 max-w-xl">
            List items, chat with buyers, and close deals — all within your verified
            college community. Textbooks, gear, campus stores, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-lg">
            <Link
              href="/listings"
              className="btn-shimmer text-white font-semibold px-7 py-3.5 rounded-xl whitespace-nowrap text-sm text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              Browse Listings
            </Link>
            <Link
              href="/register"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-sm text-center hover:bg-white/20 transition-colors duration-200"
            >
              Create Free Account
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-white/60 text-sm">No fees to join</span>
            <span className="text-white/30">·</span>
            <span className="text-white/60 text-sm">Campus pickup only</span>
            <span className="text-white/30">·</span>
            <span className="text-white/60 text-sm">Verified students</span>
          </div>
        </div>

        {/* Floating stats card */}
        <div className="hidden lg:block absolute bottom-16 right-8">
          <div className="glass-dark rounded-2xl p-5 w-56 float-anim">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Live Stats</span>
            </div>
            <div className="space-y-3">
              <div>
                <p
                  className="text-white text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
                >
                  4,820
                </p>
                <p className="text-white/50 text-xs">active listings</p>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <p
                  className="text-white text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
                >
                  320+
                </p>
                <p className="text-white/50 text-xs">campus stores</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase">Scroll</span>
        <div className="w-px h-10 bg-white/20 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full bg-white/60"
            style={{ height: "40%", animation: "scroll-indicator 2s ease-in-out infinite" }}
          />
        </div>
      </div>
    </section>
  );
}

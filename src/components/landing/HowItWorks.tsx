'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

const STEPS = [
  {
    number: '01',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'Verify your college',
    description: 'Sign up with your .edu email. We verify your enrollment so only real students from your campus get access.',
    detail: 'Instant .edu verification',
    color: 'bg-accent-muted text-accent',
  },
  {
    number: '02',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: 'List or browse items',
    description: 'Post anything - textbooks, electronics, sports gear, clothes - with photos and a minimum bid. Or browse what\'s available at your campus.',
    detail: 'Free to list, free to browse',
    color: 'bg-indigo-50 text-indigo-500',
  },
  {
    number: '03',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Bid and negotiate',
    description: 'Place bids above the minimum price. Use in-app chat to negotiate directly with the seller before finalising.',
    detail: 'Real-time bidding',
    color: 'bg-violet-50 text-violet-500',
  },
  {
    number: '04',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Self-pickup on campus',
    description: 'Coordinate a pickup spot right on campus. No shipping, no strangers off campus - everything stays within your college community.',
    detail: 'Campus meetup only',
    color: 'bg-emerald-50 text-emerald-600',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    const elems = sectionRef?.current?.querySelectorAll('.aos-elem');
    elems?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="section-header-row mb-16">
          <div className="aos-elem">
            <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase block mb-3">How It Works</span>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-primary leading-tight">
              From listing to<br />
              <span className="italic font-normal">pickup in 4 steps.</span>
            </h2>
          </div>
          <div className="aos-elem delay-200 max-w-xs">
            <p className="text-muted text-base leading-relaxed border-l-2 border-border pl-4">
              CampusKart keeps every transaction within your verified college network - safe, fast, and local.
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS?.map((step, i) => (
            <div
              key={step?.number}
              className={`aos-elem delay-${(i + 1) * 100} group relative p-7 rounded-2xl border border-border bg-surface hover:border-accent/30 hover:shadow-card-hover transition-all duration-400 flex flex-col`}
            >
              {/* Number */}
              <span className="absolute top-5 right-6 text-[40px] font-display font-semibold text-border leading-none select-none">
                {step?.number}
              </span>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${step?.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 shadow-sm group-hover:shadow-md`}>
                {step?.icon}
              </div>

              {/* Content */}
              <h3 className="font-semibold text-foreground text-base mb-2">{step?.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-4">{step?.description}</p>

              {/* Detail pill */}
              <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {step?.detail}
              </span>

              {/* Connector arrow (not last) */}
              {i < STEPS?.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white border border-border rounded-full items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex justify-center aos-elem delay-500">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-accent text-sm font-semibold hover:gap-3 transition-all duration-300"
          >
            Start selling today - it&apos;s free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
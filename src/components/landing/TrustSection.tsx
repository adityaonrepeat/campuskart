'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

const STATS = [
  {
    value: '28,400',
    suffix: '+',
    label: 'Verified students',
    description: 'Every account is verified with a valid .edu email from their enrolled institution.',
  },
  {
    value: '96',
    suffix: '%',
    label: 'Successful pickups',
    description: 'Transactions that complete without dispute, tracked across all campus locations.',
  },
  {
    value: '4.8',
    suffix: '★',
    label: 'Average seller rating',
    description: 'Community-driven reviews keep quality high and bad actors off the platform.',
  },
  {
    value: '< 2',
    suffix: 'hrs',
    label: 'Avg. report resolution',
    description: 'Our moderation team resolves reports fast so the community stays clean.',
  },
];

const TRUST_FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: 'Verified .edu only',
    body: 'No public access. Every user authenticates with a valid college email before they can view or post listings.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: 'In-app chat only',
    body: 'All negotiation happens inside CampusKart. No need to share personal phone numbers or email addresses.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Campus pickup only',
    body: 'Every handoff happens on your campus. No off-campus strangers, no shipping risk, no surprise no-shows.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Report & moderation',
    body: 'One-tap reporting on any listing or user. Our team reviews every report and acts within 2 hours.',
  },
];

export default function TrustSection() {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Stats */}
          <div>
            <div className="aos-elem mb-10">
              <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase block mb-3">Trust & Safety</span>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-primary leading-tight">
                Built for trust<br />
                <span className="italic font-normal">within your campus.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {STATS?.map((stat, i) => (
                <div key={stat?.label} className={`aos-elem delay-${(i + 1) * 100} border-l-2 border-accent/30 pl-5 hover:border-accent transition-colors duration-300`}>
                  <p className="font-display text-3xl sm:text-4xl font-semibold text-primary">
                    {stat?.value}<span className="text-accent text-2xl">{stat?.suffix}</span>
                  </p>
                  <p className="text-foreground text-sm font-medium mt-1 mb-2">{stat?.label}</p>
                  <p className="text-muted text-xs leading-relaxed">{stat?.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 aos-elem delay-500">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors duration-200 shadow-card"
              >
                Verify your student status
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRUST_FEATURES?.map((feat, i) => (
              <div
                key={feat?.title}
                className={`aos-elem delay-${(i + 1) * 100} p-6 bg-white rounded-2xl border border-border hover:border-accent/30 hover:shadow-card-hover transition-all duration-300 group`}
              >
                <div className="w-10 h-10 rounded-xl bg-accent-muted text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feat?.icon}
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-2">{feat?.title}</h3>
                <p className="text-muted text-xs leading-relaxed">{feat?.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
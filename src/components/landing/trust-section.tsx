"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const STATS = [
  {
    value: "100%",
    label: "College-scoped",
    description: "Every listing, chat, and store is visible only to verified students at your specific college.",
  },
  {
    value: "0",
    label: "Fees to join",
    description: "Free to sign up, free to browse, free to list. No commissions, no hidden charges.",
  },
  {
    value: "< 2h",
    label: "Avg. report resolution",
    description: "Our moderation team reviews every report and acts fast to keep the community clean.",
  },
  {
    value: "Real-time",
    label: "In-app chat",
    description: "No need to share phone numbers. Negotiate, agree, and coordinate pickup — all inside CampusKart.",
  },
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "College-verified only",
    body: "No public access. Every user must select and be scoped to their college before they can view or post listings.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: "In-app chat only",
    body: "All negotiation happens inside CampusKart. No need to share personal phone numbers or external contacts.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Campus pickup only",
    body: "Every handoff happens on your campus. No off-campus strangers, no shipping risk, no surprise no-shows.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Image moderation",
    body: "Every listing image is automatically screened before it goes live. Inappropriate content is blocked before it reaches students.",
  },
];

export function TrustSection() {
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
    <section ref={sectionRef} className="py-24 bg-[#F8F7F4] border-b border-[#E5E4E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Stats */}
          <div>
            <div className="aos-elem mb-10">
              <span className="text-indigo-600 text-xs font-semibold tracking-[0.2em] uppercase block mb-3">
                Trust & Safety
              </span>
              <h2
                className="text-4xl sm:text-5xl font-semibold text-[#1A1A2E] leading-tight"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                Built for trust<br />
                <span className="italic font-normal">within your campus.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`aos-elem delay-${(i + 1) * 100} border-l-2 border-indigo-200 pl-5 hover:border-indigo-500 transition-colors duration-300`}
                >
                  <p
                    className="text-3xl sm:text-4xl font-semibold text-[#1A1A2E]"
                    style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[#111111] text-sm font-medium mt-1 mb-2">{stat.label}</p>
                  <p className="text-[#6B7280] text-xs leading-relaxed">{stat.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 aos-elem delay-500">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#1A1A2E] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#1A1A2E]/90 transition-colors duration-200 shadow-md"
              >
                Join your campus
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((feat, i) => (
              <div
                key={feat.title}
                className={`aos-elem delay-${(i + 1) * 100} p-6 bg-white rounded-2xl border border-[#E5E4E0] hover:border-indigo-200 hover:shadow-lg transition-all duration-300 group`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feat.icon}
                </div>
                <h3 className="font-semibold text-[#111111] text-sm mb-2">{feat.title}</h3>
                <p className="text-[#6B7280] text-xs leading-relaxed">{feat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

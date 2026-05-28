"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const STEPS = [
  {
    number: "01",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Join your college",
    description: "Sign up and select your college. Every user is scoped to their campus — listings, chats, and stores are all college-specific.",
    detail: "College-verified community",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    number: "02",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "List or browse",
    description: "Post anything — textbooks, electronics, sports gear, clothes — with photos. Browse what your fellow students are selling.",
    detail: "Free to list, free to browse",
    color: "bg-violet-50 text-violet-500",
  },
  {
    number: "03",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: "Chat and negotiate",
    description: "Contact the seller directly through in-app chat. Negotiate the price, ask questions, agree on a pickup spot — all in one place.",
    detail: "Real-time messaging",
    color: "bg-sky-50 text-sky-500",
  },
  {
    number: "04",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Pick up on campus",
    description: "Coordinate a pickup spot right on your campus. No shipping, no strangers — safe, fast, and local.",
    detail: "Campus meetup only",
    color: "bg-emerald-50 text-emerald-600",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    sectionRef.current?.querySelectorAll(".aos-elem").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 bg-white border-b border-[#E5E4E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="aos-elem">
            <span className="text-indigo-600 text-xs font-semibold tracking-[0.2em] uppercase block mb-3">
              How It Works
            </span>
            <h2
              className="text-4xl sm:text-5xl font-semibold text-[#1A1A2E] leading-tight"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              From listing to<br />
              <span className="italic font-normal">pickup in 4 steps.</span>
            </h2>
          </div>
          <div className="aos-elem delay-200 max-w-xs">
            <p className="text-[#6B7280] text-base leading-relaxed border-l-2 border-[#E5E4E0] pl-4">
              CampusKart keeps every transaction within your verified college network — safe, fast, and completely local.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`aos-elem delay-${(i + 1) * 100} group relative p-7 rounded-2xl border border-[#E5E4E0] bg-[#F8F7F4] hover:border-indigo-200 hover:shadow-lg transition-all duration-300`}
            >
              <span className="absolute top-5 right-6 text-[40px] font-semibold text-[#E5E4E0] leading-none select-none"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
                {step.number}
              </span>
              <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>
              <h3 className="font-semibold text-[#111111] text-base mb-2">{step.title}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-4">{step.description}</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                {step.detail}
              </span>
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white border border-[#E5E4E0] rounded-full items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center aos-elem delay-500">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold hover:gap-3 transition-all duration-300"
          >
            Start selling today — it&apos;s free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

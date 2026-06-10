'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

const navLinks = [
  { label: 'Browse', href: '/listings' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Campus Stores', href: '/#campus-stores' },
];

export default function Header({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const [scrolled, setScrolled] = useState(forceScrolled);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (forceScrolled) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [forceScrolled]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-border shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <AppLogo size={36} />
            <span
              className={`text-xl font-semibold tracking-tight transition-colors duration-300 ${
                scrolled ? 'text-primary' : 'text-white'
              }`}
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              CampusKart
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header-desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium underline-link transition-colors duration-200 ${
                  scrolled ? 'text-muted hover:text-foreground' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="header-desktop-cta">
            <Link
              href="/login"
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                scrolled ? 'text-muted hover:text-foreground' : 'text-white/80 hover:text-white'
              }`}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="btn-shimmer text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-[0_2px_12px_rgba(79,70,229,0.20)] hover:shadow-accent-md transition-shadow duration-300"
            >
              Join Free
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`header-mobile-btn p-2 rounded-lg transition-colors ${
              scrolled ? 'text-foreground' : 'text-white'
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="header-mobile-panel fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div className="header-mobile-panel fixed top-0 left-0 right-0 z-50 bg-white pt-20 pb-8 px-6 shadow-xl mobile-menu-open">
          <div className="flex items-center gap-2.5 mb-8">
            <AppLogo size={32} />
            <span className="text-lg font-semibold text-primary" style={{ fontFamily: "var(--font-dm-sans)" }}>CampusKart</span>
          </div>
          <nav className="flex flex-col gap-1 mb-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-foreground py-3 border-b border-border/50 hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-center py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-surface transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="btn-shimmer text-white text-center py-3 rounded-xl font-semibold text-sm shadow-[0_2px_12px_rgba(79,70,229,0.20)]"
            >
              Join Free
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

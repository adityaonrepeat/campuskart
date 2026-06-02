'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { signOut } from '@/lib/auth-client';

const NAV_LINKS = [
  { label: 'Browse', href: '/listings' },
  { label: 'Orders', href: '/orders' },
  { label: 'Stores', href: '/stores' },
  { label: 'Chat', href: '/chat' },
];

interface AppHeaderProps {
  user: { name: string; avatarUrl?: string | null };
  forceScrolled?: boolean;
}

export default function AppHeader({ user, forceScrolled = true }: AppHeaderProps) {
  const [scrolled, setScrolled] = useState(forceScrolled);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  useEffect(() => {
    if (forceScrolled) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [forceScrolled]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[#E5E4E0] shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/listings" className="flex items-center gap-2.5 group">
            <AppLogo size={36} />
            <span
              className={`font-display text-xl font-semibold tracking-tight transition-colors duration-300 ${
                scrolled ? 'text-[#1A1A2E]' : 'text-white'
              }`}
            >
              CampusKart
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header-desktop-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium underline-link transition-colors duration-200 ${
                  pathname.startsWith(link.href)
                    ? scrolled ? 'text-[#4F46E5]' : 'text-white font-semibold'
                    : scrolled ? 'text-[#6B7280] hover:text-[#111111]' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="header-desktop-cta">
            <Link href="/profile" className="flex items-center gap-2 group" title={user.name}>
              <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-sm font-semibold text-[#4F46E5] border-2 border-[#E5E4E0] group-hover:border-[#4F46E5] transition-colors duration-200 select-none">
                {initials}
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className={`p-2 rounded-lg transition-colors duration-200 ${
                scrolled ? 'text-[#6B7280] hover:text-[#111111] hover:bg-[#F8F7F4]' : 'text-white/70 hover:text-white'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`header-mobile-btn p-2 rounded-lg transition-colors ${
              scrolled ? 'text-[#111111]' : 'text-white'
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

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="header-mobile-panel fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="header-mobile-panel fixed top-0 left-0 right-0 z-50 bg-white pt-20 pb-8 px-6 shadow-xl mobile-menu-open">
          {/* User identity */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#E5E4E0]">
            <div className="w-11 h-11 rounded-full bg-[#EEF2FF] flex items-center justify-center text-base font-semibold text-[#4F46E5] select-none">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-[#1A1A2E] text-sm">{user.name}</p>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="text-xs text-[#4F46E5] font-medium"
              >
                View Profile →
              </Link>
            </div>
          </div>

          <nav className="flex flex-col gap-1 mb-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 text-base font-medium py-3 border-b border-[#E5E4E0]/50 transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'text-[#4F46E5]'
                    : 'text-[#111111] hover:text-[#4F46E5]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 border border-[#E5E4E0] text-[#6B7280] hover:text-red-500 hover:border-red-200 py-3 rounded-xl font-semibold text-sm transition-colors duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </>
  );
}

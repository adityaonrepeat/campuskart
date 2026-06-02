import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import AppImage from '@/components/ui/AppImage';
import AuthPanel from './components/AuthPanel';

export const metadata: Metadata = {
  title: 'Join CampusKart — Sign Up or Log In',
  description: 'Create your free student account or log in to browse and bid on campus listings. Verified students only.',
  alternates: { canonical: '/sign-up-login' },
};

export default function SignUpLoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand Visual */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col bg-primary overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <AppImage
            src="/signup-photo.png"
            alt="Diverse college students studying together outdoors on campus, bright sunny day, green trees, relaxed atmosphere"
            fill
            priority
            className="object-cover object-center opacity-30"
            sizes="50vw"
          />
        </div>
        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <AppLogo size={36} />
            <span className="font-display text-xl font-semibold text-white">CampusKart</span>
          </Link>

          {/* Main text */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="font-display text-5xl xl:text-6xl font-semibold text-white leading-[0.95] mb-6">
              Your campus.<br />
              <span className="italic font-normal text-accent-light">Your deals.</span>
            </h1>
            <p className="text-white/60 text-lg font-light leading-relaxed max-w-sm mb-10">
              Join 28,400+ verified students buying, selling, and bidding on campus — all picked up right where you live and study.
            </p>

            {/* Feature bullets */}
            <div className="space-y-4">
              {[
                { icon: '🎓', text: 'Verified .edu students only' },
                { icon: '💬', text: 'In-app chat with sellers' },
                { icon: '📍', text: 'Campus self-pickup, no shipping' },
                { icon: '⭐', text: 'Ratings and reviews on every deal' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm flex-shrink-0">
                    {f.icon}
                  </span>
                  <span className="text-white/80 text-sm font-medium">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: social proof */}
          <div className="flex items-center gap-4 pt-8 border-t border-white/10">
            <div className="flex -space-x-2">
              {[
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=60&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=60&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=60&auto=format&fit=crop',
              ].map((src, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-primary overflow-hidden">
                  <AppImage
                    src={src}
                    alt={`Student ${i + 1} profile photo`}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-white/60 text-xs">
              <span className="text-white font-semibold">128 students</span> joined this week
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <AuthPanel />
        </div>
      </div>
    </div>
  );
}

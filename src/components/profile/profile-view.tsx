'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import type { ListingCard } from '@/types/listing';

const CONDITION_LABEL: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
};

interface ProfileViewProps {
  user: {
    name: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    collegeName: string;
    collegeCity: string | null;
    joinedAt: Date;
    activeListings: number;
    totalListed: number;
    soldCount: number;
  };
  listings: ListingCard[];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function ProfileView({ user, listings }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  const collegeDisplay =
    user.collegeName + (user.collegeCity ? `, ${user.collegeCity}` : '');

  return (
    <main className="min-h-screen bg-surface">
      {/* Profile hero (white card) */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Top row: avatar · info · buttons */}
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#EEF2FF] border-2 border-[#E5E4E0] shadow-md flex items-center justify-center select-none">
                <span className="text-2xl sm:text-3xl font-semibold text-[#4F46E5]">
                  {getInitials(user.name)}
                </span>
              </div>
              {/* Verified tick */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center border-2 border-white">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Name + @username same line */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-primary">
                  {user.name}
                </h1>
                <span className="text-sm text-muted">@{user.username}</span>
              </div>

              {/* College badge */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="verified-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {collegeDisplay}
                </span>
              </div>

              {/* Bio: only shown if user has set one */}
              {user.bio && (
                <p className="text-sm text-muted leading-relaxed">{user.bio}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <Link
                href="/profile/edit"
                className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-foreground hover:border-accent/40 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Profile
              </Link>
              <Link
                href="/listings"
                className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                My Orders
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Total Sales', value: user.soldCount },
              { label: 'Active Listings', value: user.activeListings },
              { label: 'Total Listed', value: user.totalListed },
              { label: 'Reviews', value: 0 },
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-surface rounded-xl py-3 border border-border">
                <p className="font-display text-2xl font-semibold text-accent">{stat.value}</p>
                <p className="text-[11px] text-muted mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs + content (off-white) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Tab nav */}
        <div className="flex gap-1 bg-white border border-border rounded-xl p-1 w-fit mb-5">
          {(['listings', 'reviews'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                activeTab === t ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-foreground'
              }`}
            >
              {t === 'listings' ? `Listings (${listings.length})` : 'Reviews'}
            </button>
          ))}
        </div>

        {/* Listings tab */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((item) => (
              <Link key={item.id} href={`/listings/${item.id}`} className="listing-card group block">
                <div className="img-zoom relative h-40">
                  {item.images[0] ? (
                    <AppImage
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted text-sm">
                      No image
                    </div>
                  )}
                  <span
                    className={`absolute top-3 left-3 tag-pill text-[10px] font-bold ${
                      item.status === 'ACTIVE' ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-foreground leading-snug mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="font-display text-xl font-semibold text-accent">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-muted">
                      {CONDITION_LABEL[item.condition] ?? item.condition}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {/* Add listing card */}
            <Link
              href="/listings/new"
              className="flex flex-col items-center justify-center h-full min-h-50 rounded-2xl border-2 border-dashed border-border hover:border-accent/40 hover:bg-accent/5 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-accent">List New Item</p>
              <p className="text-xs text-muted mt-1">Sell to your campus</p>
            </Link>
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-6">
              <div className="text-center">
                <p className="font-display text-5xl font-semibold text-accent">—</p>
                <p className="text-xs text-muted mt-1">No reviews yet</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted leading-relaxed">
                  Reviews will appear here once buyers leave feedback on your listings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

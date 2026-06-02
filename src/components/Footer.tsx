import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function Footer() {
  return (
    <footer className="bg-primary text-white/60 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <AppLogo size={32} />
              <span className="text-white font-semibold text-lg font-display">CampusKart</span>
            </div>
            <p className="text-sm leading-relaxed text-white/50 max-w-xs">
              The campus-exclusive marketplace. Buy, sell, and connect with verified students at your college.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-[0.15em] mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/listings" className="hover:text-white transition-colors">Browse Listings</Link></li>
              <li><Link href="/listings/new" className="hover:text-white transition-colors">Sell an Item</Link></li>
              <li><Link href="/#campus-stores" className="hover:text-white transition-colors">Campus Stores</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-[0.15em] mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up Free</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Log In</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} CampusKart. Campus-only marketplace. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Verified students only&nbsp;·&nbsp;Campus pickup&nbsp;·&nbsp;Real-time chat
          </p>
        </div>
      </div>
    </footer>
  );
}

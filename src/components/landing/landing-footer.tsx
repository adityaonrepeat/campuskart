import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-[#1A1A2E] text-white/60 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <span
              className="text-white font-semibold text-lg"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              CampusKart
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/listings" className="hover:text-white transition-colors">Browse</Link>
            <Link href="/register" className="hover:text-white transition-colors">Sign Up</Link>
            <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
          </div>

          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} CampusKart. Campus-only marketplace.
          </p>
        </div>
      </div>
    </footer>
  );
}

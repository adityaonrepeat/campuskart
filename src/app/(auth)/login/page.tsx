import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import AppLogo from "@/components/ui/AppLogo";

export const metadata = {
  title: "Log In — CampusKart",
  description: "Sign in to browse listings, chat with sellers, and discover what's available at your college.",
  alternates: { canonical: "/login" },
};

const SOCIAL_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=60&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=60&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=60&auto=format&fit=crop",
];

const FEATURES = [
  "College-scoped — only your campus sees your listings",
  "Real-time chat with buyers and sellers",
  "Campus stores, food, and services in one place",
  "Ratings and reviews on every deal",
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel: Brand Visual */}
      <div className="auth-left-panel lg:w-[48%] bg-primary overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/signup-photo.png"
            alt="Students on campus"
            fill
            priority
            className="object-cover object-center opacity-30"
            sizes="50vw"
          />
        </div>
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/90 via-primary/70 to-accent/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <AppLogo size={36} />
            <span className="text-xl font-semibold tracking-tight text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>CampusKart</span>
          </Link>

          {/* Main text */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="font-display text-5xl xl:text-6xl font-semibold text-white leading-[0.95] mb-6">
              Welcome back.<br />
              <span className="italic font-normal text-accent-light">Your campus awaits.</span>
            </h1>
            <p className="text-white/60 text-lg font-light leading-relaxed max-w-sm mb-10">
              Sign in to browse listings, chat with sellers, and discover what&apos;s available at your college right now.
            </p>

            {/* Feature bullets */}
            <div className="space-y-4">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-light shrink-0" />
                  <span className="text-white/80 text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: social proof */}
          <div className="flex items-center gap-4 pt-8 border-t border-white/10">
            <div className="flex -space-x-2">
              {SOCIAL_AVATARS.map((src, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-primary overflow-hidden">
                  <Image src={src} alt={`Student ${i + 1}`} width={32} height={32} unoptimized className="object-cover" />
                </div>
              ))}
            </div>
            <p className="text-white/60 text-xs">
              <span className="text-white font-semibold">128 students</span> joined this week
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white overflow-y-auto min-h-screen">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="text-lg font-semibold tracking-tight text-[#3730A3]" style={{ fontFamily: "var(--font-dm-sans)" }}>CampusKart</span>
          </Link>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

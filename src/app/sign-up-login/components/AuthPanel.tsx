'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

const COLLEGES = [
  'University of Michigan',
  'UCLA',
  'New York University',
  'Boston University',
  'University of Texas at Austin',
  'Georgia Institute of Technology',
  'Ohio State University',
  'University of Washington',
  'Stanford University',
  'Columbia University',
  'University of Chicago',
  'Northwestern University',
  'Duke University',
  'Emory University',
  'Carnegie Mellon University',
];

type Tab = 'signup' | 'login';
type AccountType = 'student' | 'store';

export default function AuthPanel() {
  const [tab, setTab] = useState<Tab>('signup');
  const [accountType, setAccountType] = useState<AccountType>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [collegeOpen, setCollegeOpen] = useState(false);

  const filteredColleges = COLLEGES.filter((c) =>
    c.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const handleCollegeSelect = (college: string) => {
    setSelectedCollege(college);
    setCollegeSearch(college);
    setCollegeOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo (mobile only) */}
      <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
        <AppLogo size={32} />
        <span className="font-display text-lg font-semibold text-primary">CampusKart</span>
      </Link>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8">
        <button
          onClick={() => setTab('signup')}
          className={`flex-1 pb-3 text-sm font-semibold transition-all duration-200 ${
            tab === 'signup' ? 'auth-tab-active' : 'auth-tab-inactive'
          }`}
        >
          Create Account
        </button>
        <button
          onClick={() => setTab('login')}
          className={`flex-1 pb-3 text-sm font-semibold transition-all duration-200 ${
            tab === 'login' ? 'auth-tab-active' : 'auth-tab-inactive'
          }`}
        >
          Log In
        </button>
      </div>

      {/* SIGN UP FORM */}
      {tab === 'signup' && (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Account Type Toggle */}
          <div className="flex gap-2 p-1 bg-surface rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setAccountType('student')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                accountType === 'student'
                  ? 'bg-white text-accent shadow-card border border-border'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setAccountType('store')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                accountType === 'store'
                  ? 'bg-white text-accent shadow-card border border-border'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              🏪 Campus Store
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {accountType === 'student' ? 'Full Name' : 'Business Name'}
            </label>
            <input
              type="text"
              placeholder={accountType === 'student' ? 'e.g. Priya Mehta' : 'e.g. The Campus Grind'}
              className="input-field"
            />
          </div>

          {/* College Selector */}
          <div className="relative">
            <label className="block text-xs font-semibold text-foreground mb-1.5">College / University</label>
            <div className="relative">
              <input
                type="text"
                value={collegeSearch}
                onChange={(e) => {
                  setCollegeSearch(e.target.value);
                  setCollegeOpen(true);
                  setSelectedCollege('');
                }}
                onFocus={() => setCollegeOpen(true)}
                placeholder="Search your college..."
                className="input-field pr-10"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            {collegeOpen && filteredColleges.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-border rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto">
                {filteredColleges.map((college) => (
                  <button
                    key={college}
                    type="button"
                    onClick={() => handleCollegeSelect(college)}
                    className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-surface transition-colors"
                  >
                    {college}
                  </button>
                ))}
              </div>
            )}
            {selectedCollege && (
              <span className="mt-1.5 verified-badge inline-flex">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Verified campus
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {accountType === 'student' ? 'Student Email (.edu)' : 'Business Email'}
            </label>
            <input
              type="email"
              placeholder={accountType === 'student' ? 'you@umich.edu' : 'hello@campusgrind.com'}
              className="input-field"
            />
            {accountType === 'student' && (
              <p className="text-[11px] text-muted mt-1.5">We&apos;ll verify your enrollment via your .edu address.</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className="input-field pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2.5 pt-1">
            <input type="checkbox" className="checkbox-custom mt-0.5 flex-shrink-0" id="terms" />
            <label htmlFor="terms" className="text-xs text-muted leading-relaxed cursor-pointer">
              I agree to CampusKart&apos;s{' '}
              <Link href="#" className="text-accent hover:underline">Terms of Service</Link> and{' '}
              <Link href="#" className="text-accent hover:underline">Privacy Policy</Link>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full btn-shimmer text-white font-semibold py-3.5 rounded-xl shadow-accent-md hover:shadow-accent-lg transition-shadow duration-300 mt-2 text-sm"
          >
            {accountType === 'student' ? 'Create Student Account' : 'Register Campus Store'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-border bg-white py-3 rounded-xl text-sm font-medium text-foreground hover:bg-surface transition-colors duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-muted mt-4">
            Already have an account?{' '}
            <button type="button" onClick={() => setTab('login')} className="text-accent font-semibold hover:underline">
              Log in
            </button>
          </p>
        </form>
      )}

      {/* LOGIN FORM */}
      {tab === 'login' && (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
            <input type="email" placeholder="you@university.edu" className="input-field" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <Link href="#" className="text-xs text-accent hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                className="input-field pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <input type="checkbox" className="checkbox-custom" id="remember" />
            <label htmlFor="remember" className="text-xs text-muted cursor-pointer">Remember me for 30 days</label>
          </div>

          <button
            type="submit"
            className="w-full btn-shimmer text-white font-semibold py-3.5 rounded-xl shadow-accent-md hover:shadow-accent-lg transition-shadow duration-300 mt-2 text-sm"
          >
            Log In to CampusKart
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-border bg-white py-3 rounded-xl text-sm font-medium text-foreground hover:bg-surface transition-colors duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-muted mt-4">
            Don&apos;t have an account?{' '}
            <button type="button" onClick={() => setTab('signup')} className="text-accent font-semibold hover:underline">
              Sign up free
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

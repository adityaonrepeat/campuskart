import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import CategoryGrid from '@/components/landing/CategoryGrid';
import FeaturedListings from '@/components/landing/FeaturedListings';
import TrustSection from '@/components/landing/TrustSection';
import CampusStores from '@/components/landing/CampusStores';

export const metadata: Metadata = {
  title: 'CampusKart — The Marketplace Built for Your Campus',
  description: 'Buy, sell, and connect with verified students at your college. Textbooks, gear, food — all picked up on campus.',
  openGraph: {
    title: 'CampusKart — Campus-Exclusive Marketplace',
    description: 'Verified students. Campus pickup. Real-time chat.',
  },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <CategoryGrid />
        <FeaturedListings />
        <TrustSection />
        <CampusStores />
      </main>
      <Footer />
    </>
  );
}

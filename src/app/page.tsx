import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TrustSection } from "@/components/landing/trust-section";
import { CampusStoresPreview } from "@/components/landing/campus-stores-preview";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <TrustSection />
      <CampusStoresPreview />
      <LandingFooter />
    </main>
  );
}

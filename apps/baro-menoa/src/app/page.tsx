import { LandingHeader } from './(landing)/components/LandingHeader';
import { HeroSection } from './(landing)/components/HeroSection';
import { FeaturesSection } from './(landing)/components/FeaturesSection';
import { HowItWorksSection } from './(landing)/components/HowItWorksSection';
import { PricingSection } from './(landing)/components/PricingSection';
import { CtaSection } from './(landing)/components/CtaSection';
import { LandingFooter } from './(landing)/components/LandingFooter';

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  );
}

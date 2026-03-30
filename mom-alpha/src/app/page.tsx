import { HeroSection } from "@/components/landing/HeroSection";
import { AgentShowcase } from "@/components/landing/AgentShowcase";
import { DayTimeline } from "@/components/landing/DayTimeline";
import { FeatureDeepDives } from "@/components/landing/FeatureDeepDives";
import { TrustPrivacy } from "@/components/landing/TrustPrivacy";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";
import { LandingNav } from "@/components/landing/LandingNav";
import { StructuredData } from "@/components/landing/StructuredData";
import { AuthRedirect } from "@/components/landing/AuthRedirect";

export default function LandingPage() {
  return (
    <>
      <AuthRedirect />
      <StructuredData />
      <LandingNav />
      <main>
        <HeroSection />
        <AgentShowcase />
        <DayTimeline />
        <FeatureDeepDives />
        <TrustPrivacy />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}

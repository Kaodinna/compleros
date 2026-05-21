import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import AudienceSection from "@/components/landing/AudienceSection";
import HowItWorks from "@/components/landing/HowItWorks";
import CTABanner from "@/components/landing/CTABanner";

export const metadata: Metadata = {
  title: "Compleros — Compliance Management for Florida Education Providers",
  description:
    "Track licenses, manage staff credentials, and stay inspection-ready. Compleros is the compliance management platform built specifically for Florida childcare centers, microschools, and private schools.",
  alternates: { canonical: "https://compleros.com" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <AudienceSection />
      <HowItWorks />
      <CTABanner
        heading="Ready to simplify your compliance?"
        subtext="Join the waitlist and be the first to know when Compleros launches. Free plan available from day one."
        btnLabel="Get Notified"
      />
    </>
  );
}

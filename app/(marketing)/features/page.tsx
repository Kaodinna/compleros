import type { Metadata } from "next";
import PageHeader from "@/components/landing/PageHeader";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CTABanner from "@/components/landing/CTABanner";

export const metadata: Metadata = {
  title: "Features — Compleros",
  description:
    "Purpose-built compliance tools for Florida childcare centers, microschools, and private schools. License tracking, compliance calendar, document management, staff credentials, inspection readiness, and more.",
  alternates: { canonical: "https://compleros.com/features" },
};

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        title="What Compleros Does"
        subtitle="Purpose-built compliance tools for childcare centers, microschools, and private schools in Florida."
      />
      <Features />
      <HowItWorks dark />
      <CTABanner
        heading="Join the waitlist for early access"
        subtext="Be among the first to use the compliance platform built for providers like you."
        btnLabel="Get Early Access"
      />
    </>
  );
}

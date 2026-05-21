import type { Metadata } from "next";
import PageHeader from "@/components/landing/PageHeader";
import Pricing from "@/components/landing/Pricing";

export const metadata: Metadata = {
  title: "Pricing — Compleros",
  description:
    "Simple, transparent pricing for Florida education providers. Start free with our Starter plan, or upgrade to Basic ($29/mo) or Premium ($79/mo). No hidden fees.",
  alternates: { canonical: "https://compleros.com/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        title="Simple, Transparent Pricing"
        subtitle="Start free. Upgrade when you're ready. No surprises, no hidden fees."
      />
      <Pricing />
    </>
  );
}

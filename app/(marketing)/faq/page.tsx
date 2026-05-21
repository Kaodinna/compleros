import type { Metadata } from "next";
import PageHeader from "@/components/landing/PageHeader";
import FAQSection from "@/components/landing/FAQSection";

export const metadata: Metadata = {
  title: "FAQ — Compleros",
  description:
    "Frequently asked questions about Compleros — the compliance management platform for Florida childcare centers, microschools, and private schools.",
  alternates: { canonical: "https://compleros.com/faq" },
};

export default function FAQPage() {
  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about Compleros."
      />
      <FAQSection />
    </>
  );
}

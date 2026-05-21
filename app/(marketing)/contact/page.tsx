import type { Metadata } from "next";
import PageHeader from "@/components/landing/PageHeader";
import ContactSection from "@/components/landing/ContactSection";

export const metadata: Metadata = {
  title: "Contact — Compleros",
  description:
    "Have questions about Compleros? Get in touch with our team. We respond within 24 hours on business days.",
  alternates: { canonical: "https://compleros.com/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="Have questions? We'd love to hear from you."
      />
      <ContactSection />
    </>
  );
}

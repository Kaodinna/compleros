import type { Metadata } from "next";
import PageHeader from "@/components/landing/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy — Compleros",
  description: "Compleros Privacy Policy — how we collect, use, and protect your information.",
  alternates: { canonical: "https://compleros.com/privacy" },
};

const sections = [
  {
    heading: "Information We Collect",
    body: "We collect information you provide directly to us, such as your name, email address, organization details, and compliance documents you upload to the platform. We also collect usage data automatically — including pages visited, features used, and device information — to help us understand how the platform is being used and improve it over time.",
  },
  {
    heading: "How We Use Your Information",
    body: "Your information is used to provide and improve the Compleros platform; send compliance alerts, deadline notifications, and regulatory updates; communicate with you about your account, product changes, and our services; ensure the security and integrity of the platform; and comply with our legal obligations.",
  },
  {
    heading: "Data Sharing",
    body: "We do not sell your personal information to third parties. We may share data with trusted service providers who help us operate the platform (such as cloud hosting, email delivery, and analytics providers) under strict data processing agreements. We will comply with valid legal requests for information as required by applicable law and will notify you where legally permitted to do so.",
  },
  {
    heading: "Data Security",
    body: "We use industry-standard security measures to protect your information, including encryption in transit (TLS) and at rest, access controls, and regular security reviews. While no system is 100% secure, we take the protection of your compliance data seriously and apply appropriate technical and organizational safeguards.",
  },
  {
    heading: "Data Retention",
    body: "We retain your information for as long as your account is active or as needed to provide the platform's services. If you close your account, we will delete or anonymize your personal information within 90 days, unless we are required to retain it for legal or regulatory purposes.",
  },
  {
    heading: "Your Rights",
    body: "You have the right to access, correct, export, or delete your personal information at any time. You may also opt out of non-essential communications at any time by using the unsubscribe link in any email or by contacting us directly. To exercise any of these rights, contact us at info@compleros.com.",
  },
  {
    heading: "Cookies",
    body: "We use essential cookies to keep you logged in and remember your preferences. We may also use analytics cookies to understand how the platform is used. You can control cookie settings through your browser, though disabling certain cookies may affect platform functionality.",
  },
  {
    heading: "Contact",
    body: "For privacy-related questions or to exercise your rights, contact us at info@compleros.com.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        subtitle="Last updated: March 2026"
      />

      <section className="py-[100px] px-6">
        <div className="section-container">
          <div className="max-w-[760px] mx-auto">
            <p className="text-[15px] text-muted leading-[1.8] mb-10 p-5 bg-cream border border-border rounded-card">
              <strong className="text-navy">Note:</strong> This is placeholder
              privacy policy content. Final legal copy will be reviewed by
              counsel before public launch.
            </p>

            {sections.map((s) => (
              <div key={s.heading} className="mb-10">
                <h2 className="font-heading text-[28px] font-semibold text-navy mb-4">
                  {s.heading}
                </h2>
                <p className="text-[15px] text-muted leading-[1.8]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import PageHeader from "@/components/landing/PageHeader";

export const metadata: Metadata = {
  title: "Terms of Service — Compleros",
  description: "Compleros Terms of Service — your agreement with us for using the platform.",
  alternates: { canonical: "https://compleros.com/terms" },
};

const sections = [
  {
    heading: "Acceptance of Terms",
    body: "By accessing or using the Compleros platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you may not use the platform. These terms apply to all users, including users on free plans.",
  },
  {
    heading: "Use of Service",
    body: "Compleros provides a compliance management platform for education providers. You agree to use the platform only for lawful purposes and in accordance with these terms. You are responsible for the accuracy of information you enter into the platform, including license details, staff credentials, and uploaded documents.",
  },
  {
    heading: "Account Responsibility",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account. Compleros will not be liable for any loss resulting from unauthorized access to your account.",
  },
  {
    heading: "Intellectual Property",
    body: "The Compleros platform, including its design, features, content, regulatory data, and underlying technology, is the property of Compleros and is protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works from any part of the platform without our express written consent.",
  },
  {
    heading: "Disclaimer of Warranties",
    body: "Compleros provides compliance tracking tools, regulatory information, and organizational features, but does not provide legal advice. While we strive for accuracy in our regulatory data, regulations change frequently and you are ultimately responsible for verifying your compliance obligations with the relevant agencies.",
  },
  {
    heading: "Limitation of Liability",
    body: "To the maximum extent permitted by law, Compleros shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of revenue, data, or goodwill, arising from your use of the platform. Compleros shall not be liable for any compliance failures, regulatory actions, or license revocations.",
  },
  {
    heading: "Termination",
    body: "We reserve the right to suspend or terminate your access to the platform at any time for violations of these Terms. You may cancel your account at any time. Upon termination, your right to use the platform ceases immediately.",
  },
  {
    heading: "Governing Law",
    body: "These Terms shall be governed by the laws of the State of Florida, without regard to its conflict of law principles. Any disputes arising from these Terms shall be resolved in the courts of Florida.",
  },
  {
    heading: "Changes to Terms",
    body: "We may update these Terms from time to time. We will notify you of material changes via email or a notice on the platform. Continued use of the platform after changes constitute your acceptance of the updated Terms.",
  },
  {
    heading: "Contact",
    body: "Questions about these Terms? Contact us at info@compleros.com.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="Terms of Service"
        subtitle="Last updated: March 2026"
      />

      <section className="py-[100px] px-6">
        <div className="section-container">
          <div className="max-w-[760px] mx-auto">
            <p className="text-[15px] text-muted leading-[1.8] mb-10 p-5 bg-cream border border-border rounded-card">
              <strong className="text-navy">Note:</strong> This is placeholder
              terms of service content. Final legal copy will be reviewed by
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

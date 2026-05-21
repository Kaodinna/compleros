import type { Metadata } from "next";
import PageHeader from "@/components/landing/PageHeader";
import CTABanner from "@/components/landing/CTABanner";

export const metadata: Metadata = {
  title: "About Compleros",
  description:
    "Compleros exists because education providers deserve better than spreadsheets and guesswork for something as critical as compliance. Learn about our mission and values.",
  alternates: { canonical: "https://compleros.com/about" },
};

const values = [
  {
    title: "Accuracy",
    desc: "Regulatory data must be right. There's no room for 'close enough' when a license is on the line.",
  },
  {
    title: "Transparency",
    desc: "Providers see exactly where they stand — no hidden statuses, no surprises at inspection time.",
  },
  {
    title: "Timeliness",
    desc: "The right information at the right time. Alerts that arrive when there's still time to act.",
  },
  {
    title: "Ownership",
    desc: "We take responsibility for the platform's quality and our users' compliance outcomes.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Compleros"
        subtitle="We exist because education providers deserve better than spreadsheets and guesswork for something as critical as compliance."
      />

      {/* Mission */}
      <section className="py-[100px] px-6" aria-labelledby="mission-heading">
        <div className="section-container">
          <div className="max-w-[700px]">
            <p className="section-tag">Our Mission</p>
            <h2
              id="mission-heading"
              className="section-title"
            >
              Make compliance effortless for the people who educate our children
            </h2>
            <p className="text-[17px] text-muted leading-[1.8] mb-6">
              Childcare directors and school administrators already wear a dozen
              hats. Tracking license renewals, managing staff credentials,
              staying current on regulatory changes, and preparing for
              inspections shouldn&apos;t consume their evenings and weekends.
            </p>
            <p className="text-[17px] text-muted leading-[1.8] mb-6">
              Compleros was founded to solve that problem. We&apos;re building
              the compliance management platform that Florida&apos;s education
              providers have been asking for — one that understands their
              regulatory environment, automates the work that drains their time,
              and gives them confidence that nothing is falling through the
              cracks.
            </p>
            <p className="text-[17px] text-muted leading-[1.8]">
              We&apos;re based right here in Florida, tracking the same
              regulations you navigate every day — built by people who
              understand the stakes.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <div className="bg-cream">
        <section
          className="py-[100px] px-6"
          aria-labelledby="values-heading"
        >
          <div className="section-container">
            <p className="section-tag">What We Believe</p>
            <h2 id="values-heading" className="section-title">
              Four non-negotiables
            </h2>
            <p className="section-desc">
              These aren&apos;t just values on a wall. They&apos;re the
              standard every feature, every alert, and every interaction is
              built against.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="pl-6 border-l-[3px] border-gold bg-white rounded-r-card pr-6 py-8"
                >
                  <h3 className="font-heading text-[20px] font-semibold text-navy mb-3">
                    {v.title}
                  </h3>
                  <p className="text-[14px] text-muted leading-[1.7]">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <CTABanner
        heading="Built in Florida, for Florida providers"
        subtext="We're based right here in the state we serve, tracking the same regulations you navigate every day."
        btnLabel="Join the Waitlist"
      />
    </>
  );
}

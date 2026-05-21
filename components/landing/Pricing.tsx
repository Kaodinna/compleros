"use client";

import { useState } from "react";

type Plan = {
  label: string;
  name: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  period: string;
  annualNote?: string;
  features: string[];
  cta: string;
  featured: boolean;
  ctaStyle: "outline" | "gold" | "white";
};

const plans: Plan[] = [
  {
    label: "Starter",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    period: "Free forever · No credit card required",
    features: [
      "1 program license tracker",
      "View-only compliance calendar",
      "250 MB document storage",
      "Up to 5 staff profiles",
      "5 document templates",
      "Regulatory updates feed",
      "Basic inspection checklist",
      "Knowledge base access",
    ],
    cta: "Get Started Free",
    featured: false,
    ctaStyle: "outline",
  },
  {
    label: "Most Popular",
    name: "Basic",
    monthlyPrice: 29,
    annualPrice: 24,
    period: "/month",
    annualNote: "Save 17% with annual billing",
    features: [
      "Everything in Free, plus:",
      "Unlimited license tracking",
      "Automated email alerts (30/14/7 days)",
      "5 GB document storage",
      "Up to 30 staff profiles",
      "Credential expiration tracking",
      "Full DCF template library",
      "Agency-specific filtering",
      "Exportable compliance reports",
      "Email support",
    ],
    cta: "Join Waitlist",
    featured: true,
    ctaStyle: "gold",
  },
  {
    label: "Full Platform",
    name: "Premium",
    monthlyPrice: 79,
    annualPrice: 66,
    period: "/month",
    annualNote: "Save 17% with annual billing",
    features: [
      "Everything in Basic, plus:",
      "Multi-location tracking",
      "SMS + email alerts",
      "25 GB document storage",
      "Unlimited staff profiles",
      "Staff compliance scoring",
      "Inspection prep toolkit",
      "Scholarship compliance guides",
      "Dedicated onboarding",
      "Priority support (4-hr response)",
      "File-for-You concierge (add-on)",
    ],
    cta: "Join Waitlist",
    featured: false,
    ctaStyle: "outline",
  },
];

const faqs = [
  {
    q: "Is the Free plan really free forever?",
    a: "Yes. The Free tier is a permanent plan, not a trial. You can use it as long as you want with no credit card required. Upgrade when your needs grow — it's optional.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Absolutely. Upgrade, downgrade, or cancel anytime. If you switch from monthly to annual billing, we prorate the difference.",
  },
  {
    q: "What is the File-for-You concierge?",
    a: "A Premium add-on where our team handles compliance filings, license renewals, and document submissions on your behalf. Pricing available at launch.",
  },
  {
    q: "Do I need Compleros if I already use Brightwheel or Procare?",
    a: "Yes — Compleros complements those tools. Center management platforms handle billing, attendance, and parent comms. Compleros goes deep on compliance: regulatory tracking, inspection readiness, credential monitoring, and legislative change alerts.",
  },
];

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-gold shrink-0 mt-0.5"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section
      id="pricing"
      className="py-[100px] px-6"
      aria-labelledby="pricing-heading"
    >
      <div className="section-container">
        {/* Billing toggle */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 bg-cream border border-border rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                !annual
                  ? "bg-navy text-white shadow-sm"
                  : "text-muted hover:text-navy"
              }`}
              aria-pressed={!annual}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 flex items-center gap-2 ${
                annual
                  ? "bg-navy text-white shadow-sm"
                  : "text-muted hover:text-navy"
              }`}
              aria-pressed={annual}
            >
              Annual
              <span className="text-[11px] font-semibold bg-gold/20 text-gold-dark px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const price =
              plan.monthlyPrice === 0
                ? 0
                : annual
                ? plan.annualPrice
                : plan.monthlyPrice;

            return (
              <div
                key={plan.name}
                className={`pricing-card ${
                  plan.featured ? "pricing-card-featured" : ""
                }`}
              >
                <p
                  className={`text-[13px] font-semibold uppercase tracking-[1.5px] mb-2 ${
                    plan.featured ? "text-gold-light" : "text-gold"
                  }`}
                >
                  {plan.label}
                </p>
                <h3
                  className={`font-heading text-[28px] font-semibold mb-4 ${
                    plan.featured ? "text-white" : "text-navy"
                  }`}
                >
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-1">
                  {price === 0 ? (
                    <span
                      className={`font-heading text-[48px] font-bold ${
                        plan.featured ? "text-white" : "text-navy"
                      }`}
                    >
                      $0
                    </span>
                  ) : (
                    <span
                      className={`font-heading text-[48px] font-bold ${
                        plan.featured ? "text-white" : "text-navy"
                      }`}
                    >
                      ${price}
                      <span
                        className={`text-[18px] font-normal ${
                          plan.featured ? "text-white/60" : "text-muted"
                        }`}
                      >
                        /mo
                      </span>
                    </span>
                  )}
                </div>
                <p
                  className={`text-[13px] mb-8 ${
                    plan.featured ? "text-white/50" : "text-muted"
                  }`}
                >
                  {price === 0
                    ? plan.period
                    : annual && plan.annualNote
                    ? plan.annualNote
                    : "Billed monthly"}
                </p>

                {/* Features */}
                <ul className="mb-8 space-y-0">
                  {plan.features.map((feat, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2.5 py-2.5 text-[14px] border-b ${
                        plan.featured
                          ? "text-white/85 border-white/10"
                          : "text-[#2D2D2D] border-border"
                      } ${
                        feat.includes("plus:") ? "font-semibold" : ""
                      }`}
                    >
                      <CheckIcon />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`w-full py-3.5 rounded-btn text-[15px] font-semibold transition-all duration-200 ${
                    plan.ctaStyle === "gold"
                      ? "bg-gold text-white hover:bg-gold-dark"
                      : plan.ctaStyle === "white"
                      ? "bg-white text-navy hover:bg-cream"
                      : plan.featured
                      ? "border-2 border-white text-white hover:bg-white hover:text-navy"
                      : "border-2 border-navy text-navy hover:bg-navy hover:text-white"
                  }`}
                  onClick={() => window.location.href = "/contact"}
                  aria-label={`${plan.cta} for ${plan.name} plan`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Enterprise note */}
        <p className="text-center text-[14px] text-muted mt-8">
          Running multiple locations?{" "}
          <a
            href="/contact"
            className="text-navy font-semibold hover:underline"
          >
            Contact us for enterprise pricing →
          </a>
        </p>

        {/* Pricing FAQs */}
        <div className="mt-20 max-w-[760px] mx-auto">
          <h3 className="font-heading text-[28px] text-navy font-semibold text-center mb-10">
            Pricing questions
          </h3>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-border">
                <button
                  className="w-full flex justify-between items-center py-5 gap-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <h4 className="font-heading text-[18px] font-semibold text-navy">
                    {faq.q}
                  </h4>
                  <span
                    className={`text-gold text-[18px] transition-transform duration-300 shrink-0 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-40 pb-4" : "max-h-0"
                  }`}
                >
                  <p className="text-[15px] text-muted leading-[1.7]">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

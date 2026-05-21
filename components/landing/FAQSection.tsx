"use client";

import { useState } from "react";

type FAQItem = {
  q: string;
  a: string;
};

type FAQCategory = {
  category: string;
  items: FAQItem[];
};

const faqData: FAQCategory[] = [
  {
    category: "General",
    items: [
      {
        q: "What is Compleros?",
        a: "Compleros is a compliance management platform built specifically for Florida childcare centers, microschools, private schools, and early childhood education providers. We help you track licenses, manage staff credentials, stay current on regulatory changes, and prepare for DCF inspections.",
      },
      {
        q: "Who is Compleros built for?",
        a: "Licensed childcare centers, home-based childcare providers, microschools, private schools, and any early childhood education program in Florida that needs to manage regulatory compliance.",
      },
      {
        q: "Is Compleros only for Florida providers?",
        a: "We're launching with deep coverage of Florida regulations — Chapter 402 F.S., F.A.C. 65C-22, DCF, and scholarship programs. Expansion to additional states is on our roadmap.",
      },
    ],
  },
  {
    category: "Platform",
    items: [
      {
        q: "Does Compleros replace my childcare management software?",
        a: "No. Compleros is designed to complement tools like Brightwheel, Procare, and Playground. Those platforms handle billing, attendance, and parent communication. Compleros focuses specifically on compliance management — a depth those platforms don't offer.",
      },
      {
        q: "What regulatory agencies does Compleros track?",
        a: "We track obligations across 14 Florida agencies, with DCF as the anchor. This includes the Department of Health, DBPR, OEL, and scholarship program requirements from Step Up for Students, FTC, FES, and Gardiner.",
      },
      {
        q: "How does the compliance calendar work?",
        a: "The calendar maps all your upcoming deadlines across every tracked license, permit, and credential. On paid plans, you receive automated alerts at 30, 14, and 7 days before each deadline — so you always have time to act.",
      },
    ],
  },
  {
    category: "Pricing & Plans",
    items: [
      {
        q: "Is the Free plan really free?",
        a: "Yes. It's a permanent free tier, not a time-limited trial. You get core compliance visibility with no credit card required and no expiration date.",
      },
      {
        q: "What does the File-for-You concierge include?",
        a: "The concierge service (available as a Premium add-on) means our team handles filings, renewals, and document submissions on your behalf. You focus on running your program while we handle the paperwork.",
      },
    ],
  },
  {
    category: "Getting Started",
    items: [
      {
        q: "When does Compleros launch?",
        a: "We're currently in development with a launch targeted for 2026. Join the waitlist to get early access and be among the first users.",
      },
      {
        q: "How long does setup take?",
        a: "Most providers are up and running in under 15 minutes. Create your account, add your programs and staff, and the platform maps your compliance obligations automatically.",
      },
    ],
  },
];

export default function FAQSection() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section
      id="faq"
      className="py-[100px] px-6"
      aria-labelledby="faq-heading"
    >
      <div className="section-container">
        <div className="max-w-[760px] mx-auto">
          {faqData.map((cat) => (
            <div key={cat.category} className="mb-10">
              <p className="text-[12px] font-semibold uppercase tracking-[2px] text-gold mb-4">
                {cat.category}
              </p>
              <div className="space-y-0">
                {cat.items.map((item, i) => {
                  const key = `${cat.category}-${i}`;
                  const isOpen = openMap[key];
                  return (
                    <div key={key} className="border-b border-border">
                      <button
                        className="w-full flex justify-between items-center py-5 gap-4 text-left"
                        onClick={() => toggle(key)}
                        aria-expanded={isOpen}
                      >
                        <h3 className="font-heading text-[18px] font-semibold text-navy">
                          {item.q}
                        </h3>
                        <span
                          className={`text-gold text-[16px] transition-transform duration-300 shrink-0 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        >
                          ▼
                        </span>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? "max-h-60 pb-4" : "max-h-0"
                        }`}
                      >
                        <p className="text-[15px] text-muted leading-[1.7]">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="text-center text-[15px] text-muted mt-10">
            Still have questions?{" "}
            <a
              href="/contact"
              className="text-navy font-semibold hover:underline"
            >
              Contact us →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

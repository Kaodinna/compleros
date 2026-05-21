"use client";

import Link from "next/link";
import WaitlistInput from "./WaitlistInput";

function DashboardMockup() {
  return (
    <div className="bg-navy rounded-2xl p-9 relative overflow-hidden min-h-[420px] shadow-card-lg">
      <div className="absolute top-0 right-0 w-3/5 h-full bg-gradient-to-br from-transparent to-gold/15 pointer-events-none" />

      {/* Compliance Score */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-5 mb-4">
        <p className="text-[11px] text-white/60 uppercase tracking-[1px] font-semibold mb-2">
          Overall Compliance Score
        </p>
        <p className="font-heading text-[32px] text-white font-semibold leading-none">
          94%
        </p>
        <p className="text-[13px] text-gold-light mt-1">
          3 items need attention
        </p>
        <div className="mt-3 h-[6px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-[94%] bg-gold rounded-full dash-fill" />
        </div>
      </div>

      {/* Mini cards */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4">
          <p className="text-[11px] text-white/60 uppercase tracking-[1px] font-semibold mb-2">
            Active Licenses
          </p>
          <p className="font-heading text-[24px] text-white font-semibold">12</p>
          <p className="text-[12px] text-gold-light mt-0.5">
            2 renewals in 30 days
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4">
          <p className="text-[11px] text-white/60 uppercase tracking-[1px] font-semibold mb-2">
            Staff Credentials
          </p>
          <p className="font-heading text-[24px] text-white font-semibold">
            28/30
          </p>
          <p className="text-[12px] text-gold-light mt-0.5">2 expiring soon</p>
        </div>
      </div>

      {/* Next deadline */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-5">
        <p className="text-[11px] text-white/60 uppercase tracking-[1px] font-semibold mb-2">
          Next Deadline
        </p>
        <p className="font-heading text-[20px] text-white font-semibold leading-snug">
          DCF License Renewal
        </p>
        <p className="text-[13px] text-gold-light mt-1">
          Due April 15, 2026 · 29 days away
        </p>
      </div>

      <div className="absolute bottom-5 right-5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-[11px] text-white/40">Live</span>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="pt-[120px] pb-[60px] md:pt-[160px] md:pb-[100px] px-6 bg-hero-gradient relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-radial-gold pointer-events-none opacity-80" />
      <div className="absolute -bottom-[100px] -left-[100px] w-[400px] h-[400px] rounded-full bg-radial-navy pointer-events-none opacity-60" />

      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-border px-4 py-1.5 rounded-full text-[13px] font-medium text-navy mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Built for Florida Education Providers
            </div>

            <h1
              id="hero-heading"
              className="font-heading text-[36px] sm:text-[44px] md:text-[52px] leading-[1.15] font-semibold text-navy mb-6 tracking-[-0.5px]"
            >
              Compliance management that{" "}
              <em className="not-italic text-gold">works for you</em>
            </h1>

            <p className="text-[15px] sm:text-[17px] md:text-[18px] leading-[1.7] text-muted mb-8 md:mb-10 max-w-[480px]">
              Track licenses, manage credentials, and stay inspection-ready —
              all in one platform built specifically for childcare centers,
              microschools, and private schools in Florida.
            </p>

            {/* Waitlist input */}
            <div className="mb-8">
              <WaitlistInput
                placeholder="Enter your work email"
                btnLabel="Join Waitlist"
                btnClassName="bg-gold text-white hover:bg-gold-dark"
              />
            </div>

            {/* Secondary CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/features"
                className="text-[15px] font-semibold text-navy hover:text-navy-dark underline underline-offset-4 decoration-border hover:decoration-navy transition-colors"
              >
                See How It Works →
              </Link>
              <span className="hidden sm:block w-px h-4 bg-border" />
              <p className="text-[13px] text-muted/70 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-success shrink-0"
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
                Free forever plan · No credit card
              </p>
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="w-full">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

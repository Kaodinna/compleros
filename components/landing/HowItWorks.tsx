const steps = [
  {
    num: "1",
    title: "Sign Up",
    desc: "Create your free account in under two minutes. No credit card required — get instant access to your compliance dashboard.",
  },
  {
    num: "2",
    title: "Connect Your Programs",
    desc: "Add your licenses, permits, and staff credentials. Compleros automatically maps your obligations across Florida's regulatory agencies.",
  },
  {
    num: "3",
    title: "Stay Compliant",
    desc: "Receive automated alerts, track every deadline, and generate audit-ready reports. Compliance runs on autopilot.",
  },
];

interface HowItWorksProps {
  dark?: boolean;
}

export default function HowItWorks({ dark = false }: HowItWorksProps) {
  return (
    <section
      id="how-it-works"
      className={dark ? "bg-navy py-16 md:py-[100px] px-6" : "py-16 md:py-[100px] px-6 bg-cream"}
      aria-labelledby="how-heading"
    >
      <div className="section-container">
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <p className={`section-tag ${dark ? "!text-gold" : ""}`}>How It Works</p>
          <h2
            id="how-heading"
            className={`font-heading text-[28px] sm:text-[34px] md:text-[40px] font-semibold leading-[1.2] mb-4 ${
              dark ? "text-white" : "text-navy"
            }`}
          >
            Three steps to compliance confidence
          </h2>
          <p
            className={`text-[17px] leading-[1.7] ${
              dark ? "text-white/70" : "text-muted"
            }`}
          >
            No consultants. No spreadsheets. Just a clear path to staying
            compliant — starting from day one.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 relative">
          {/* Connector line (desktop) */}
          <div
            className={`hidden md:block absolute top-[28px] left-[calc(16.66%+12px)] right-[calc(16.66%+12px)] h-px z-0 ${
              dark ? "bg-white/15" : "bg-border"
            }`}
          />

          {steps.map((step) => (
            <div key={step.num} className="text-center relative z-10">
              <div
                className={`w-14 h-14 rounded-full font-heading text-[24px] font-semibold flex items-center justify-center mx-auto mb-6 ${
                  dark
                    ? "bg-gold text-white shadow-[0_4px_20px_rgba(196,152,90,0.3)]"
                    : "bg-navy text-white shadow-card"
                }`}
              >
                {step.num}
              </div>
              <h3
                className={`font-heading text-[22px] font-semibold mb-3 ${
                  dark ? "text-white" : "text-navy"
                }`}
              >
                {step.title}
              </h3>
              <p
                className={`text-[14px] leading-[1.7] max-w-[280px] mx-auto ${
                  dark ? "text-white/60" : "text-muted"
                }`}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

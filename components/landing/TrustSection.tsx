const stats = [
  { value: "14", label: "Florida agencies tracked", icon: "🏛️" },
  { value: "100%", label: "Florida-specific regulations", icon: "📍" },
  { value: "30-14-7", label: "Day alert cadence", icon: "⏰" },
  { value: "$0", label: "To get started", icon: "✓" },
];

const trustBadges = [
  {
    icon: "🔒",
    title: "DCF-Aware",
    desc: "Built around Chapter 402 F.S. and F.A.C. 65C-22 — the rules that govern your license.",
  },
  {
    icon: "📍",
    title: "Florida-Native",
    desc: "Headquartered in Florida, tracking the same regulations you navigate every day.",
  },
  {
    icon: "🛡️",
    title: "Secure by Design",
    desc: "Your compliance data is encrypted at rest and in transit. We never sell your information.",
  },
  {
    icon: "🎯",
    title: "Compliance-Focused",
    desc: "Not a generic project manager with compliance features — built from the ground up for regulatory compliance.",
  },
];

export default function TrustSection() {
  return (
    <section
      id="trust"
      className="bg-navy py-16 md:py-[100px] px-6"
      aria-labelledby="trust-heading"
    >
      <div className="section-container">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center p-6 bg-white/5 border border-white/10 rounded-card"
            >
              <div className="text-[28px] mb-3" role="img" aria-label={s.label}>
                {s.icon}
              </div>
              <p className="font-heading text-[36px] font-bold text-white leading-none mb-1">
                {s.value}
              </p>
              <p className="text-[13px] text-white/50 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="text-center max-w-[640px] mx-auto mb-12">
          <p className="section-tag !text-gold">Why Compleros</p>
          <h2
            id="trust-heading"
            className="font-heading text-[24px] sm:text-[30px] md:text-[36px] font-semibold text-white leading-[1.2]"
          >
            Built specifically for Florida providers — not adapted for them
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {trustBadges.map((b) => (
            <div
              key={b.title}
              className="flex items-start gap-5 p-6 bg-white/5 border border-white/10 rounded-card hover:border-gold/30 transition-colors duration-300"
            >
              <div className="text-[28px] shrink-0" role="img" aria-label={b.title}>
                {b.icon}
              </div>
              <div>
                <h3 className="font-heading text-[20px] font-semibold text-white mb-2">
                  {b.title}
                </h3>
                <p className="text-[14px] text-white/60 leading-[1.7]">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Agencies */}
        <div className="mt-16 p-8 bg-white/5 border border-white/10 rounded-card text-center">
          <p className="text-[13px] text-white/40 uppercase tracking-[2px] font-semibold mb-4">
            Regulatory Coverage
          </p>
          <p className="text-[15px] text-white/60 leading-[1.8] max-w-[700px] mx-auto">
            Department of Children &amp; Families (DCF) · Florida Department of
            Health · DBPR · Office of Early Learning (OEL) · Step Up for
            Students · Florida Tax Credit (FTC) · Family Empowerment
            Scholarship (FES) · Gardiner Scholarship · and 6 more
          </p>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: "📋",
    title: "License & Permit Tracking",
    desc: "Monitor every active license and permit in one dashboard. See renewal dates, current status, and required actions at a glance — no more hunting through filing cabinets.",
    highlight: false,
  },
  {
    icon: "📅",
    title: "Compliance Calendar & Alerts",
    desc: "Automated email and SMS reminders at 30, 14, and 7 days before every deadline. Never miss a DCF renewal or filing date again.",
    highlight: true,
  },
  {
    icon: "📁",
    title: "Document Management",
    desc: "Upload, organize, and track expiration dates for every compliance document. Includes ready-to-use templates for the most common DCF and Florida DOH forms.",
    highlight: false,
  },
  {
    icon: "💡",
    title: "Regulatory Updates",
    desc: "Stay current on changes across 14 Florida regulatory agencies. Filter by the agencies that affect your program type and get plain-language summaries of what changed.",
    highlight: false,
  },
  {
    icon: "👥",
    title: "Staff Credential Monitoring",
    desc: "Track certifications, training hours, background check statuses, and credential expiration for every team member — organized and always inspection-ready.",
    highlight: false,
  },
  {
    icon: "🔍",
    title: "Inspection Readiness",
    desc: "Self-assessment checklists, a full DCF violation tier reference, and mock inspection workflows so you know exactly where you stand before the inspector arrives.",
    highlight: true,
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-[100px] px-6"
      aria-labelledby="features-heading"
    >
      <div className="section-container">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <article
              key={f.title}
              className={`feature-card ${
                f.highlight ? "border-gold/40 bg-cream/40" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cream to-cream-dark flex items-center justify-center mb-5 text-[22px]" role="img" aria-label={f.title}>
                {f.icon}
              </div>
              <h3 className="font-heading text-[20px] font-semibold text-navy mb-3">
                {f.title}
              </h3>
              <p className="text-[14px] text-muted leading-[1.7]">{f.desc}</p>
            </article>
          ))}
        </div>

        {/* Bottom callout */}
        <div className="mt-16 p-8 bg-cream rounded-card border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-heading text-[22px] text-navy font-semibold mb-1">
              Covers all 14 Florida regulatory agencies
            </h3>
            <p className="text-[14px] text-muted">
              DCF · Department of Health · DBPR · OEL · Step Up · FTC · FES ·
              Gardiner · and more
            </p>
          </div>
          <a
            href="/pricing"
            className="whitespace-nowrap shrink-0 bg-navy text-white px-6 py-3 rounded-btn font-semibold text-sm hover:bg-navy-dark transition-all duration-200"
          >
            See Plans &amp; Pricing
          </a>
        </div>
      </div>
    </section>
  );
}

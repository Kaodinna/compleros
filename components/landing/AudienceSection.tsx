const audiences = [
  {
    icon: "🏫",
    title: "Childcare Centers",
    desc: "Licensed centers navigating DCF regulations, staff ratios, and renewal cycles.",
  },
  {
    icon: "📚",
    title: "Microschools",
    desc: "Lean teams that need compliance on autopilot without a dedicated admin.",
  },
  {
    icon: "🎓",
    title: "Private Schools",
    desc: "Independent schools managing multi-agency obligations across programs.",
  },
  {
    icon: "🌱",
    title: "ECE Providers",
    desc: "Home-based and center-based early childhood education programs.",
  },
];

export default function AudienceSection() {
  return (
    <section
      id="about"
      className="py-[100px] px-6"
      aria-labelledby="audience-heading"
    >
      <div className="section-container">
        <p className="section-tag">Who We Serve</p>
        <h2 id="audience-heading" className="section-title max-w-[580px]">
          Built for education providers who can&apos;t afford to miss a deadline
        </h2>
        <p className="section-desc">
          Whether you run a single childcare center or a network of
          microschools, Compleros keeps your compliance organized and on track —
          so you can focus on the children in your care.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="text-center p-8 bg-white border border-border rounded-card hover:border-gold hover:shadow-card transition-all duration-300"
            >
              <div
                className="text-[36px] mb-4"
                role="img"
                aria-label={a.title}
              >
                {a.icon}
              </div>
              <h3 className="font-heading text-[17px] text-navy font-semibold mb-2">
                {a.title}
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

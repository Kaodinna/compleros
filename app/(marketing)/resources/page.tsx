import type { Metadata } from "next";
import PageHeader from "@/components/landing/PageHeader";
import CTABanner from "@/components/landing/CTABanner";

export const metadata: Metadata = {
  title: "Resources — Compleros",
  description:
    "Compliance insights, regulatory updates, and practical guides for Florida education providers. Stay current on DCF rules, scholarship programs, and childcare regulations.",
  alternates: { canonical: "https://compleros.com/resources" },
};

const posts = [
  {
    icon: "📋",
    tag: "Regulatory Updates",
    title: "SB 218: What Florida School-Operated Programs Need to Know Before July 2026",
    excerpt:
      "A breakdown of the new carve-out for school-operated programs and how it affects your DCF compliance obligations going forward.",
    date: "March 10, 2026",
    readTime: "6 min read",
  },
  {
    icon: "🔍",
    tag: "Compliance Tips",
    title: "DCF Inspection Prep: A Step-by-Step Guide for Childcare Centers",
    excerpt:
      "Everything you need to have ready before the inspector arrives, organized by DCF violation class and inspection category.",
    date: "March 3, 2026",
    readTime: "8 min read",
  },
  {
    icon: "💡",
    tag: "Industry News",
    title: "5 Compliance Mistakes That Cost Florida Childcare Centers Their License",
    excerpt:
      "Real examples from DCF enforcement actions and how to avoid the most common pitfalls that put licenses at risk.",
    date: "February 24, 2026",
    readTime: "5 min read",
  },
  {
    icon: "📚",
    tag: "Guides",
    title: "Understanding Florida's 14 Regulatory Agencies: A Primer for Providers",
    excerpt:
      "A plain-language overview of which agencies govern your program, what they require, and how their requirements interact.",
    date: "February 17, 2026",
    readTime: "10 min read",
  },
  {
    icon: "🎓",
    tag: "Scholarship Compliance",
    title: "Step Up, FES, and Gardiner: Staying Compliant Across All Three Programs",
    excerpt:
      "How to manage the distinct compliance requirements of Florida's three major scholarship programs without dropping the ball.",
    date: "February 10, 2026",
    readTime: "7 min read",
  },
  {
    icon: "📅",
    tag: "Compliance Tips",
    title: "The Annual Compliance Calendar Every Florida Childcare Director Needs",
    excerpt:
      "Month-by-month breakdown of Florida's recurring compliance obligations — from DCF renewals to background check cycles.",
    date: "February 3, 2026",
    readTime: "9 min read",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        title="Resources"
        subtitle="Compliance insights, regulatory updates, and practical guides for Florida education providers."
      />

      <section className="py-[100px] px-6" aria-label="Resource articles">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-7">
            {posts.map((post) => (
              <article
                key={post.title}
                className="border border-border rounded-card overflow-hidden bg-white hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Image placeholder */}
                <div className="h-[180px] bg-cream flex items-center justify-center text-[40px]">
                  {post.icon}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[1px] text-gold mb-2.5">
                    {post.tag}
                  </p>
                  <h2 className="font-heading text-[19px] font-semibold text-navy mb-3 leading-[1.3]">
                    {post.title}
                  </h2>
                  <p className="text-[14px] text-muted leading-[1.6] mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <p className="text-[12px] text-muted/70">
                    {post.date} · {post.readTime}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        heading="Subscribe for compliance updates"
        subtext="Get regulatory alerts and compliance tips delivered to your inbox. Stay current without the manual work."
        btnLabel="Subscribe"
      />
    </>
  );
}

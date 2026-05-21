"use client";

import { useState } from "react";

const contactInfo = [
  { icon: "✉️", title: "Email", detail: "info@compleros.com" },
  { icon: "📍", title: "Location", detail: "Based in Florida, serving Florida providers" },
  { icon: "⏰", title: "Response Time", detail: "We respond within 24 hours on business days" },
];

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="py-[100px] px-6" aria-label="Contact form">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-16 max-w-[960px] mx-auto">
          {/* Form */}
          <div>
            {sent ? (
              <div className="p-8 bg-success/10 border border-success/20 rounded-card text-center">
                <div className="text-[36px] mb-4">✓</div>
                <h2 className="font-heading text-[22px] text-navy font-semibold mb-2">
                  Message sent!
                </h2>
                <p className="text-[15px] text-muted">
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-[13px] font-semibold text-navy mb-1.5 tracking-[0.3px]"
                  >
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-3 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy placeholder:text-muted/50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-[13px] font-semibold text-navy mb-1.5 tracking-[0.3px]"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="jane@yourschool.com"
                    className="w-full px-4 py-3 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy placeholder:text-muted/50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-[13px] font-semibold text-navy mb-1.5 tracking-[0.3px]"
                  >
                    Subject
                  </label>
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy"
                  >
                    <option>General Inquiry</option>
                    <option>Demo Request</option>
                    <option>Partnership</option>
                    <option>Press</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-[13px] font-semibold text-navy mb-1.5 tracking-[0.3px]"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us how we can help…"
                    className="w-full px-4 py-3 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy placeholder:text-muted/50 resize-y min-h-[120px]"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full !py-3.5 !text-[15px]"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div>
            <h2 className="font-heading text-[24px] text-navy font-semibold mb-8">
              Other ways to reach us
            </h2>
            <div className="space-y-6 mb-10">
              {contactInfo.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-cream border border-border flex items-center justify-center text-[18px] shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-navy mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-[14px] text-muted">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <blockquote className="p-6 bg-cream border border-border rounded-card">
              <p className="text-[15px] text-muted leading-[1.7] italic font-heading">
                &ldquo;We exist because education providers deserve better than
                spreadsheets and guesswork for something as critical as
                compliance.&rdquo;
              </p>
              <footer className="text-[13px] font-semibold text-navy mt-3">
                — The Compleros Team
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}

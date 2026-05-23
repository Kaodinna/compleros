"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

const platformLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Resources", href: "#faq" },
  { label: "FAQ", href: "#faq" },
];

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-navy-dark pt-20 pb-10 px-6"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="hover:opacity-90 transition-opacity inline-block mb-5"
              aria-label="Compleros home"
            >
              <Logo variant="white" height={52} />
            </Link>
            <p className="text-[14px] text-white/50 leading-[1.7] max-w-[300px] mb-6">
              Compliance management built for Florida&apos;s education
              providers. Track licenses, manage credentials, and stay
              inspection-ready.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {[
                { label: "Twitter / X", symbol: "𝕏" },
                { label: "LinkedIn", symbol: "in" },
                { label: "Facebook", symbol: "f" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={`Compleros on ${s.label}`}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[13px] text-white/40 hover:bg-white/10 hover:text-gold-light transition-all duration-200"
                >
                  {s.symbol}
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="font-heading text-[16px] font-semibold text-white mb-5">
              Platform
            </h3>
            <nav aria-label="Platform links">
              {platformLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-[14px] text-white/50 hover:text-gold-light transition-colors duration-200 mb-3"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-heading text-[16px] font-semibold text-white mb-5">
              Company
            </h3>
            <nav aria-label="Company links">
              {companyLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-[14px] text-white/50 hover:text-gold-light transition-colors duration-200 mb-3"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[13px] text-white/30">
            &copy; {currentYear} Compleros. All rights reserved. Built in
            Florida.
          </p>
          <p className="text-[13px] text-white/20">info@compleros.com</p>
        </div>
      </div>
    </footer>
  );
}

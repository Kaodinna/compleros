"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border transition-all duration-300 ${
        scrolled ? "shadow-[0_2px_20px_rgba(27,77,107,0.08)]" : ""
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link
            href="/"
            className="hover:opacity-90 transition-opacity"
            aria-label="Compleros home"
          >
            <Logo variant="navy" height={56} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8" role="list">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 tracking-[0.2px] ${
                  isActive(link.href)
                    ? "text-navy font-semibold"
                    : "text-muted hover:text-navy"
                }`}
                role="listitem"
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-navy hover:text-navy-dark transition-colors duration-200 px-4 py-2"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="btn-primary text-sm !py-2.5 !px-5"
            >
              Start Free
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden flex flex-col gap-[5px] p-2 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span
              className={`w-6 h-0.5 bg-navy transition-all duration-300 block ${
                mobileOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-navy transition-all duration-300 block ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-navy transition-all duration-300 block ${
                mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-border px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors py-1 ${
                isActive(link.href)
                  ? "text-navy font-semibold"
                  : "text-muted hover:text-navy"
              }`}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-navy text-center py-2.5 border border-border rounded-btn hover:border-navy transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="btn-primary text-center block"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

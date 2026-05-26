"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { useNav } from "./nav-context";
import { usePricing } from "./pricing-context";
import type { User } from "@supabase/supabase-js";

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "⊞" }],
  },
  {
    label: "Compliance Core",
    items: [
      { label: "License Tracker", href: "/licenses", icon: "📋" },
      { label: "Calendar", href: "/calendar", icon: "📅" },
      { label: "Documents", href: "/documents", icon: "📁" },
      { label: "Staff Profiles", href: "/staff", icon: "👥" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Regulatory Updates", href: "/updates", icon: "💡" },
      { label: "Inspection Prep", href: "/inspection", icon: "🔍" },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Settings", href: "/settings", icon: "⚙️" }],
  },
];

export default function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const { open, close } = useNav();
  const { open: openPricing } = usePricing();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`flex flex-col w-[248px] shrink-0 bg-[#143A52] h-screen overflow-y-auto transition-transform duration-300 ease-in-out fixed lg:sticky top-0 left-0 z-50 lg:z-auto ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      {/* Logo + mobile close */}
      <div className="px-5 py-[18px] border-b border-white/[0.07] flex items-center justify-between">
        <Link href="/dashboard" onClick={close}>
          <Logo variant="white" height={32} />
        </Link>
        <button
          onClick={close}
          className="lg:hidden text-white/50 hover:text-white transition-colors p-1"
          aria-label="Close navigation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pt-3.5 pb-1 text-[9px] font-bold uppercase tracking-[1.5px] text-white/22">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={`flex items-center gap-2.5 py-[9px] px-3 mx-2 rounded-[7px] text-[13px] transition-all duration-100 ${
                    active
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white/85"
                  }`}
                >
                  <span className="text-[15px] w-5 text-center shrink-0">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Plan badge */}
      <div className="mx-2 mb-2 rounded-[9px] p-3 border border-[rgba(196,152,90,0.15)] bg-[rgba(196,152,90,0.08)]">
        <p className="text-[9px] uppercase tracking-[1px] text-[#D4AD74] font-bold">Current Plan</p>
        <p className="text-[13px] font-semibold text-white mt-0.5">Free (Starter)</p>
        <p className="text-[11px] text-white/35 mt-0.5">$0/month · Free forever</p>
        <button type="button" onClick={openPricing} className="text-[11px] text-[#D4AD74] hover:text-gold mt-1.5 block transition-colors text-left">
          Compare Plans →
        </button>
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/[0.07] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-[11px] font-bold text-white shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-white truncate">{displayName}</p>
        </div>
        <button onClick={signOut} className="text-[11px] text-white/30 hover:text-white/60 transition-colors">
          →
        </button>
      </div>
    </aside>
  );
}

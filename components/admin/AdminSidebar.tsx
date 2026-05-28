"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAdmin } from "./admin-context";
import type { User } from "@supabase/supabase-js";

const navGroups = [
  {
    label: "Platform",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        label: "Providers",
        href: "/admin/providers",
        badge: "247",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
      {
        label: "Compliance",
        href: "/admin/compliance",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        ),
      },
      {
        label: "Documents",
        href: "/admin/documents",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
        ),
      },
      {
        label: "Subscriptions",
        href: "/admin/subscriptions",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Analytics",
        href: "/admin/analytics",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
          </svg>
        ),
      },
      {
        label: "Alerts",
        href: "/admin/alerts",
        badge: "3",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        ),
      },
      {
        label: "Resources & Blog",
        href: "/admin/resources",
        badge: "18",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        ),
      },
      {
        label: "Settings",
        href: "/admin/settings",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

export default function AdminSidebar({
  user,
  mobileOpen,
  onClose,
}: {
  user: User;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useAdmin();

  const displayName =
    user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Admin";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleProfileClick = () => {
    showToast("Profile settings");
  };

  return (
    <aside
      className={`flex flex-col w-[260px] shrink-0 bg-[#1B4D6B] h-screen overflow-y-auto fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="px-7 py-6 border-b border-white/[0.08] flex items-center justify-between">
        <Link href="/admin/dashboard" onClick={onClose}>
          <span className="font-heading text-[1.5rem] text-cream tracking-wide">
            Compleros
          </span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden text-white/40 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-7 pt-[22px] pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-white/35">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`relative flex items-center gap-3 px-7 py-[11px] text-[0.9rem] transition-all duration-150 ${
                    active
                      ? "text-cream bg-white/10 font-semibold"
                      : "text-white/65 hover:text-cream hover:bg-white/[0.06]"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-gold rounded-r-[3px]" />
                  )}
                  <span className={`shrink-0 ${active ? "opacity-100" : "opacity-55 group-hover:opacity-100"}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-gold text-navy-dark text-[0.68rem] font-bold px-2 py-[2px] rounded-[10px] min-w-[22px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <button
        onClick={handleProfileClick}
        className="px-7 py-4 border-t border-white/[0.08] flex items-center gap-2.5 hover:bg-white/[0.04] transition-colors text-left w-full"
      >
        <div className="w-[34px] h-[34px] rounded-full bg-gold flex items-center justify-center text-[0.78rem] font-bold text-navy-dark shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.84rem] font-semibold text-cream truncate">{displayName}</p>
          <p className="text-[0.7rem] text-white/45">Admin</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
          className="text-[0.7rem] text-white/30 hover:text-white/60 transition-colors shrink-0"
          title="Sign out"
        >
          →
        </button>
      </button>
    </aside>
  );
}

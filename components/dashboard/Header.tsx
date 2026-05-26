"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useNav } from "./nav-context";
import { usePricing } from "./pricing-context";
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toggle } = useNav();
  const { open: openPricing } = usePricing();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-[60px] bg-white border-b border-border flex items-center justify-between px-4 lg:px-7 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggle}
          className="lg:hidden shrink-0 p-1.5 rounded-[6px] hover:bg-cream text-navy transition-colors"
          aria-label="Open navigation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <h1 className="font-heading text-[16px] lg:text-[18px] text-navy font-semibold truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={openPricing}
          title="Upgrade to Basic for automated alerts"
          className="w-[34px] h-[34px] rounded-[8px] border border-border flex items-center justify-center text-[14px] bg-white hover:bg-cream transition-colors"
        >
          🔔
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-[34px] h-[34px] rounded-[8px] bg-navy text-white flex items-center justify-center text-[11px] font-semibold cursor-pointer"
          >
            {initials}
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-[42px] bg-white border border-border rounded-card shadow-card min-w-[160px] py-1 z-50"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className="px-4 py-2 border-b border-border">
                <p className="text-[12px] font-semibold text-navy truncate">{displayName}</p>
                <p className="text-[11px] text-muted truncate">{user?.email}</p>
              </div>
              <Link
                href="/settings"
                className="block px-4 py-2 text-[13px] text-muted hover:text-navy hover:bg-cream transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-2 text-[13px] text-muted hover:text-navy hover:bg-cream transition-colors"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

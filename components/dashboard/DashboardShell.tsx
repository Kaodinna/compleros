"use client";

import { useState } from "react";
import { NavCtx } from "./nav-context";
import { PricingCtx } from "./pricing-context";
import PricingModal from "./PricingModal";
import DashboardSidebar from "./Sidebar";
import type { User } from "@supabase/supabase-js";

export default function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  return (
    <NavCtx.Provider value={{ open: navOpen, toggle: () => setNavOpen(v => !v), close: () => setNavOpen(false) }}>
      <PricingCtx.Provider value={{ open: () => setPricingOpen(true) }}>
        <div className="min-h-screen bg-[#F7F6F3] flex">
          <DashboardSidebar user={user} />

          {/* Mobile nav backdrop */}
          {navOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setNavOpen(false)}
              aria-hidden="true"
            />
          )}

          <div className="flex-1 min-w-0 flex flex-col">{children}</div>
        </div>

        {pricingOpen && <PricingModal onClose={() => setPricingOpen(false)} />}
      </PricingCtx.Provider>
    </NavCtx.Provider>
  );
}

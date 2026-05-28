"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminProvider, useAdmin } from "./admin-context";
import AdminSidebar from "./AdminSidebar";
import type { User } from "@supabase/supabase-js";

function Toast() {
  const { toastMessage, toastVisible } = useAdmin();
  return (
    <div
      className={`fixed bottom-7 right-7 z-[500] bg-[#143A52] text-cream px-[22px] py-[14px] rounded-[10px] text-[0.86rem] font-medium flex items-center gap-2.5 max-w-[380px] shadow-[0_12px_40px_rgba(27,77,107,0.18)] transition-all duration-300 ${
        toastVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-5 pointer-events-none"
      }`}
    >
      <svg className="w-[18px] h-[18px] shrink-0 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
      <span>{toastMessage}</span>
    </div>
  );
}

function SlidePanel() {
  const { panelOpen, panelConfig, closePanel } = useAdmin();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closePanel]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-[rgba(27,43,56,0.35)] z-[300] backdrop-blur-[2px] transition-opacity duration-250 ${
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closePanel}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[520px] max-w-[92vw] bg-white z-[310] flex flex-col shadow-[-8px_0_40px_rgba(27,77,107,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="px-7 py-[22px] border-b border-border flex items-start justify-between shrink-0">
          <div>
            <h2 className="font-heading text-[1.2rem] font-normal text-navy leading-snug">
              {panelConfig?.title ?? ""}
            </h2>
            {panelConfig?.subtitle && (
              <p className="text-[0.78rem] text-muted mt-1">{panelConfig.subtitle}</p>
            )}
          </div>
          <button
            onClick={closePanel}
            className="w-8 h-8 flex items-center justify-center border border-border rounded-[6px] text-muted hover:border-navy hover:text-navy transition-all ml-4 shrink-0"
          >
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {panelConfig?.body}
        </div>

        {/* Panel footer */}
        {panelConfig?.footer && (
          <div className="px-7 py-4 border-t border-border flex gap-2.5 shrink-0">
            {panelConfig.footer}
          </div>
        )}
      </div>
    </>
  );
}

function ShellInner({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex">
      <AdminSidebar
        user={user}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 ml-0 lg:ml-[260px]">
        {/* Mobile header bar */}
        <div className="lg:hidden h-14 bg-white border-b border-border flex items-center px-4 gap-3 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-[6px] hover:bg-cream text-navy transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="font-heading text-navy text-[1.1rem]">Compleros Admin</span>
        </div>

        {children}
      </div>

      <SlidePanel />
      <Toast />
    </div>
  );
}

export default function AdminShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <ShellInner user={user}>{children}</ShellInner>
    </AdminProvider>
  );
}

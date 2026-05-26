"use client";

import { useEffect } from "react";

export default function PricingModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] p-7 sm:p-9 w-full max-w-[580px] shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-heading text-[22px] font-bold text-navy text-center mb-6">Compare Plans</h2>

        <div className="grid grid-cols-3 gap-3">
          {/* Free */}
          <div className="border-2 border-[#2E7D52] rounded-[14px] p-4 sm:p-5 text-center flex flex-col items-center">
            <div className="text-[9px] font-bold text-[#2E7D52] uppercase tracking-[1px] mb-2">Current Plan</div>
            <div className="font-heading text-[18px] font-bold text-navy">Free</div>
            <div className="font-heading text-[30px] font-bold text-navy mt-2 leading-none">$0</div>
            <div className="text-[11px] text-muted mt-1">forever</div>
          </div>

          {/* Basic */}
          <div className="bg-[#1B4D6B] rounded-[14px] p-4 sm:p-5 text-center flex flex-col items-center">
            <div className="text-[9px] font-bold text-[#C4985A] uppercase tracking-[1px] mb-2">Most Popular</div>
            <div className="font-heading text-[18px] font-bold text-white">Basic</div>
            <div className="font-heading text-[30px] font-bold text-white mt-2 leading-none">$29</div>
            <div className="text-[11px] text-white/50 mt-1">/month</div>
          </div>

          {/* Premium */}
          <div className="border border-[#E2DFD8] rounded-[14px] p-4 sm:p-5 text-center flex flex-col items-center">
            <div className="text-[9px] font-bold text-[#C4985A] uppercase tracking-[1px] mb-2">Full Platform</div>
            <div className="font-heading text-[18px] font-bold text-navy">Premium</div>
            <div className="font-heading text-[30px] font-bold text-navy mt-2 leading-none">$79</div>
            <div className="text-[11px] text-muted mt-1">/month</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="block mx-auto mt-6 text-[13px] text-muted hover:text-navy transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

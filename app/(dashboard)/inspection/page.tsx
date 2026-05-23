"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/dashboard/Header";
import Link from "next/link";

interface ChecklistItem { id: string; category: string; item_text: string; display_order: number; }

const CATEGORY_TITLES: Record<string, string> = {
  "Facility Safety": "Facility Safety",
  "Staff Records": "Staff Records",
  "Child Records": "Child Records",
  "Health & Sanitation": "Health & Sanitation",
  "Program Operations": "Program Operations",
};

export default function InspectionPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const [{ data: checkItems }, { data: comps }] = await Promise.all([
      supabase.from("checklist_items").select("*").order("display_order"),
      supabase.from("checklist_completions").select("checklist_item_id, is_completed").eq("user_id", user.id),
    ]);
    setItems(checkItems ?? []);
    const map: Record<string, boolean> = {};
    (comps ?? []).forEach((c: { checklist_item_id: string; is_completed: boolean }) => { map[c.checklist_item_id] = c.is_completed; });
    setCompletions(map);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (itemId: string) => {
    if (!userId || toggling) return;
    setToggling(itemId);
    const next = !(completions[itemId] ?? false);
    setCompletions(prev => ({ ...prev, [itemId]: next }));
    const { error } = await supabase.from("checklist_completions").upsert(
      { user_id: userId, checklist_item_id: itemId, is_completed: next, completed_at: next ? new Date().toISOString() : null },
      { onConflict: "user_id,checklist_item_id" }
    );
    if (error) setCompletions(prev => ({ ...prev, [itemId]: !next }));
    else if (next) {
      const item = items.find(i => i.id === itemId);
      if (item) await supabase.from("activity_log").insert({ user_id: userId, icon: "✅", description: `Completed: ${item.item_text}` });
    }
    setToggling(null);
  };

  const resetAll = async () => {
    if (!userId || !confirm("Reset all checklist items?")) return;
    setCompletions({});
    await supabase.from("checklist_completions").delete().eq("user_id", userId);
  };

  const total = items.length;
  const completed = items.filter(i => completions[i.id]).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const categories = Array.from(new Set(items.map(i => i.category)));

  // Small ring: r=24, circ≈150.8
  const r = 24, circ = 2 * Math.PI * r;
  const ringOffset = circ - (pct / 100) * circ;

  return (
    <>
      <Header title="Inspection Readiness" />
      <div className="p-[24px_28px] space-y-4">

        {/* Progress bar */}
        <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-5 flex items-center gap-5">
          {/* Small ring */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="28" cy="28" r={r} fill="none" stroke="#E2DFD8" strokeWidth="5" />
              <circle cx="28" cy="28" r={r} fill="none" stroke="#1B4D6B" strokeWidth="5"
                strokeDasharray={circ} strokeDashoffset={ringOffset} strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.3s ease" }} />
            </svg>
            <span className="absolute font-heading text-[16px] font-bold text-navy">{pct}%</span>
          </div>
          <div className="flex-1">
            <div className="font-heading text-[15px] font-semibold text-navy">Inspection Readiness</div>
            <div className="text-[12px] text-muted mt-0.5">{completed} of {total} items completed</div>
          </div>
          <button onClick={resetAll} className="border border-[#E2DFD8] rounded-[9px] px-[18px] py-2 text-[12px] font-semibold text-[#2D2D2D] hover:border-navy hover:text-navy transition-colors">
            Reset
          </button>
        </div>

        {/* Checklist Categories */}
        {loading ? (
          <div className="text-center py-16 text-[13px] text-muted">Loading…</div>
        ) : (
          categories.map(cat => {
            const catItems = items.filter(i => i.category === cat);
            return (
              <div key={cat} className="bg-white border border-[#E2DFD8] rounded-[12px] p-[22px]">
                <div className="font-heading text-[15px] font-semibold text-navy pb-1.5 border-b border-[#E2DFD8] mb-2">
                  {CATEGORY_TITLES[cat] ?? cat}
                </div>
                <div className="divide-y divide-[#F3F2EF]">
                  {catItems.map(item => {
                    const done = completions[item.id] ?? false;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 py-2 text-[13px] cursor-pointer"
                        onClick={() => toggle(item.id)}
                      >
                        <div className={`w-[18px] h-[18px] border-2 rounded-[4px] flex items-center justify-center shrink-0 text-[10px] transition-colors ${
                          done ? "bg-[#2E7D52] border-[#2E7D52] text-white" : "border-[#E2DFD8] hover:border-navy"
                        }`}>
                          {done ? "✓" : ""}
                        </div>
                        <span className={done ? "line-through text-muted" : "text-[#2D2D2D]"}>{item.item_text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Gate 1 */}
        <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[18px] py-3.5 flex items-center gap-3">
          <span className="text-[16px]">⚠️</span>
          <div className="flex-1">
            <h4 className="text-[13px] font-semibold text-navy">DCF Violation Reference (Class 1–3)</h4>
            <p className="text-[12px] text-muted">Understand violation severity and corrective action requirements. Available on Basic.</p>
          </div>
          <Link href="/pricing" className="shrink-0 bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">See Plans</Link>
        </div>

        {/* Gate 2 */}
        <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[18px] py-3.5 flex items-center gap-3">
          <span className="text-[16px]">🔍</span>
          <div className="flex-1">
            <h4 className="text-[13px] font-semibold text-navy">Run a Mock DCF Inspection</h4>
            <p className="text-[12px] text-muted">Simulate a full inspection and get a readiness score. Available on Premium.</p>
          </div>
          <Link href="/pricing" className="shrink-0 bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">See Plans</Link>
        </div>
      </div>
    </>
  );
}

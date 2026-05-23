"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import Link from "next/link";

type Tab = "account" | "program" | "billing" | "notifications";
const PROGRAM_TYPES = ["Childcare Center", "Home-Based Childcare", "Microschool", "Private School", "VPK Provider", "Before/After School"];
const COUNTIES = ["Sarasota", "Manatee", "Hillsborough", "Pinellas", "Orange", "Miami-Dade", "Broward", "Palm Beach", "Duval", "Other"];
const ENROLLMENT_OPTIONS = ["1–10", "11–25", "26–50", "51–100", "100+"];

export default function SettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [accountForm, setAccountForm] = useState({ first_name: "", last_name: "", email: "", newPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [programForm, setProgramForm] = useState({ name: "", type: "", county: "", enrollment_range: "", programId: "" });
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [planType, setPlanType] = useState("free");

  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: profile }, { data: program }] = await Promise.all([
      supabase.from("profiles").select("full_name, plan_type, email_digest_enabled").eq("id", user.id).single(),
      supabase.from("programs").select("id, name, type, county, enrollment_range").eq("user_id", user.id).limit(1).maybeSingle(),
    ]);
    const fullName = profile?.full_name ?? "";
    const parts = fullName.split(" ");
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ") ?? "";
    setAccountForm(f => ({ ...f, first_name: firstName, last_name: lastName, email: user.email ?? "" }));
    setPlanType(profile?.plan_type ?? "free");
    setDigestEnabled(profile?.email_digest_enabled ?? true);
    if (program) setProgramForm({ name: program.name, type: program.type, county: program.county, enrollment_range: program.enrollment_range ?? "", programId: program.id });
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const flash = (m: string, isErr = false) => {
    if (isErr) { setError(m); setMsg(""); } else { setMsg(m); setError(""); }
    setTimeout(() => { setMsg(""); setError(""); }, 3000);
  };

  const saveAccount = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const fullName = `${accountForm.first_name.trim()} ${accountForm.last_name.trim()}`.trim();
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    if (accountForm.newPassword) {
      if (accountForm.newPassword.length < 8) { flash("Password must be at least 8 characters.", true); setSaving(false); return; }
      const { error: pwErr } = await supabase.auth.updateUser({ password: accountForm.newPassword });
      if (pwErr) { flash(pwErr.message, true); setSaving(false); return; }
    }
    flash("Changes saved.");
    setSaving(false);
  };

  const saveProgram = async () => {
    setSaving(true);
    if (programForm.programId) {
      await supabase.from("programs").update({ name: programForm.name.trim(), type: programForm.type, county: programForm.county, enrollment_range: programForm.enrollment_range || null }).eq("id", programForm.programId);
    }
    flash("Program updated.");
    setSaving(false);
  };

  const saveNotifs = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ email_digest_enabled: digestEnabled }).eq("id", user.id);
    flash("Preferences saved.");
    setSaving(false);
  };

  const deleteAccount = async () => {
    if (!confirm("Permanently delete your account and all data? This cannot be undone.")) return;
    await supabase.auth.signOut();
    router.push("/");
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "account", label: "Account" },
    { id: "program", label: "Program" },
    { id: "billing", label: "Plan & Billing" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <>
      <Header title="Settings" />
      <div className="p-[24px_28px]">
        <div className="max-w-[520px]">

          {/* Tab nav — underline style */}
          <div className="flex border-b border-[#E2DFD8] mb-6">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setMsg(""); setError(""); }}
                className={`px-5 py-2.5 text-[13px] border-b-2 -mb-px transition-colors ${
                  tab === t.id ? "text-navy border-navy font-semibold" : "text-muted border-transparent font-medium"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {msg && <div className="text-[13px] text-[#2E7D52] bg-[#ECFDF5] border border-[#2E7D52]/20 rounded-[8px] px-4 py-2 mb-4">{msg}</div>}
          {error && <div className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-4 py-2 mb-4">{error}</div>}

          {loading ? (
            <div className="text-center py-10 text-[13px] text-muted">Loading…</div>
          ) : (
            <>
              {/* ACCOUNT */}
              {tab === "account" && (
                <div>
                  <div className="font-heading text-[18px] font-semibold text-navy mb-[18px]">Account Settings</div>
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">First Name</label>
                      <input value={accountForm.first_name} onChange={e => setAccountForm(f => ({ ...f, first_name: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">Last Name</label>
                      <input value={accountForm.last_name} onChange={e => setAccountForm(f => ({ ...f, last_name: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">Email</label>
                      <input value={accountForm.email} disabled className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] text-muted bg-[#F8F7F4] cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">New Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={accountForm.newPassword} onChange={e => setAccountForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Leave blank to keep current" className="w-full px-[15px] py-[11px] pr-10 border border-[#E2DFD8] rounded-[8px] text-[13px] placeholder:text-muted/60 focus:outline-none focus:border-navy" />
                        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy transition-colors" tabIndex={-1}>
                          {showPassword ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <button onClick={saveAccount} disabled={saving} className="bg-navy text-white rounded-[9px] px-[18px] py-2.5 text-[14px] font-semibold disabled:opacity-50 hover:bg-[#143A52] transition-colors mt-2">
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                  <div className="mt-8 pt-5 border-t border-[#E2DFD8]">
                    <button onClick={deleteAccount} className="text-[13px] text-[#C0392B] cursor-pointer hover:underline">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* PROGRAM */}
              {tab === "program" && (
                <div>
                  <div className="font-heading text-[18px] font-semibold text-navy mb-[18px]">Program Settings</div>
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">Program Name</label>
                      <input value={programForm.name} onChange={e => setProgramForm(f => ({ ...f, name: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">Program Type</label>
                      <select value={programForm.type} onChange={e => setProgramForm(f => ({ ...f, type: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy bg-white">
                        {PROGRAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">County</label>
                      <select value={programForm.county} onChange={e => setProgramForm(f => ({ ...f, county: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy bg-white">
                        {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">Children Enrolled</label>
                      <select value={programForm.enrollment_range} onChange={e => setProgramForm(f => ({ ...f, enrollment_range: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy bg-white">
                        <option value="">Select…</option>
                        {ENROLLMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <button onClick={saveProgram} disabled={saving} className="bg-navy text-white rounded-[9px] px-[18px] py-2.5 text-[14px] font-semibold disabled:opacity-50 hover:bg-[#143A52] transition-colors mt-2">
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* BILLING */}
              {tab === "billing" && (
                <div>
                  <div className="font-heading text-[18px] font-semibold text-navy mb-[18px]">Plan & Billing</div>
                  <div className="bg-cream rounded-[10px] p-[18px] mb-5">
                    <div className="text-[12px] font-semibold text-[#A87D42] uppercase tracking-[1px] mb-1">Current Plan</div>
                    <div className="text-[18px] font-semibold text-navy capitalize">{planType === "free" ? "Free (Starter)" : planType}</div>
                    <div className="text-[13px] text-muted mt-1">
                      {planType === "free" ? "1 license · 5 staff · 250 MB storage · 5 templates · Basic checklist" : "Full access"}
                    </div>
                  </div>
                  <Link href="/pricing" className="block w-full bg-gold text-white rounded-[9px] py-3 text-[14px] font-semibold text-center hover:bg-[#A87D42] transition-colors">
                    Compare Plans & Upgrade
                  </Link>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {tab === "notifications" && (
                <div>
                  <div className="font-heading text-[18px] font-semibold text-navy mb-[18px]">Notification Preferences</div>
                  <div className="space-y-0 divide-y divide-[#E2DFD8]">
                    {/* Active toggle */}
                    <div className="flex justify-between items-center py-3">
                      <div>
                        <div className="text-[13px] font-medium text-[#2D2D2D]">Weekly regulatory digest</div>
                        <div className="text-[11px] text-muted">Summary of updates delivered to your email</div>
                      </div>
                      <button
                        onClick={() => setDigestEnabled(e => !e)}
                        className={`relative w-10 h-[22px] rounded-full transition-colors ${digestEnabled ? "bg-[#2E7D52]" : "bg-[#E2DFD8]"}`}
                      >
                        <div className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all ${digestEnabled ? "left-[20px]" : "left-[2px]"}`} />
                      </button>
                    </div>
                    {/* Locked */}
                    {[
                      { label: "Deadline alerts (email)", desc: "30 / 14 / 7 day reminders", plan: "Basic" },
                      { label: "Credential expiration alerts", desc: "When staff certs are expiring", plan: "Basic" },
                      { label: "SMS alerts", desc: "Text message notifications", plan: "Premium" },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-3 opacity-40">
                        <div>
                          <div className="text-[13px] font-medium">{item.label}</div>
                          <div className="text-[11px] text-muted">{item.desc}</div>
                        </div>
                        <div className="text-[10px] text-muted">🔒 {item.plan}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={saveNotifs} disabled={saving} className="mt-5 bg-navy text-white rounded-[9px] px-[18px] py-2.5 text-[14px] font-semibold disabled:opacity-50 hover:bg-[#143A52] transition-colors">
                    {saving ? "Saving…" : "Save Preferences"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/dashboard/Header";
import Link from "next/link";
import SeePlansButton from "@/components/dashboard/SeePlansButton";

const STAFF_ROLES = ["Director", "Lead Teacher", "Assistant Teacher", "Admin Staff", "Other"];
const FREE_LIMIT = 5;
const AVATAR_COLORS = ["bg-navy", "bg-[#4A7B9D]", "bg-[#6B8E6B]", "bg-[#9B6B6B]", "bg-[#7B6B9B]"];

interface StaffMember {
  id: string; first_name: string; last_name: string; role: string;
  email: string | null; phone: string | null; start_date: string | null; notes: string | null;
}

const blankForm = { first_name: "", last_name: "", role: "", email: "", phone: "", start_date: "", notes: "" };

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [planType, setPlanType] = useState("free");

  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: s }, { data: profile }] = await Promise.all([
      supabase.from("staff").select("*").eq("user_id", user.id).order("last_name"),
      supabase.from("profiles").select("plan_type").eq("id", user.id).single(),
    ]);
    setStaff(s ?? []);
    setPlanType(profile?.plan_type ?? "free");
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(blankForm); setError(""); setShowModal(true); };
  const openEdit = (s: StaffMember) => {
    setEditing(s);
    setForm({ first_name: s.first_name, last_name: s.last_name, role: s.role, email: s.email ?? "", phone: s.phone ?? "", start_date: s.start_date ?? "", notes: s.notes ?? "" });
    setError(""); setShowModal(true);
  };

  const save = async () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.role) { setError("Name and role are required."); return; }
    setSaving(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = { user_id: user.id, first_name: form.first_name.trim(), last_name: form.last_name.trim(), role: form.role, email: form.email.trim() || null, phone: form.phone.trim() || null, start_date: form.start_date || null, notes: form.notes.trim() || null };
    let err;
    if (editing) {
      ({ error: err } = await supabase.from("staff").update(payload).eq("id", editing.id));
    } else {
      ({ error: err } = await supabase.from("staff").insert(payload));
      if (!err) await supabase.from("activity_log").insert({ user_id: user.id, icon: "🤝", description: `Added staff member ${form.first_name.trim()} ${form.last_name.trim()}` });
    }
    if (err) { setError(err.message); } else { setShowModal(false); load(); }
    setSaving(false);
  };

  const deleteStaff = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    await supabase.from("staff").delete().eq("id", id);
    load();
  };

  const isFree = planType === "free";
  const atLimit = isFree && staff.length >= FREE_LIMIT;

  return (
    <>
      <Header title="Staff Profiles" />
      <div className="p-4 sm:p-[24px_28px] space-y-5">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="text-[13px] text-muted">{staff.length} / {FREE_LIMIT} staff profiles</div>
          {!atLimit && (
            <button onClick={openAdd} className="bg-navy text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#143A52] transition-colors">
              + Add Staff
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-[13px] text-muted">Loading…</div>
        ) : staff.length === 0 ? (
          <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-12 text-center">
            <div className="text-[32px] mb-3">👥</div>
            <p className="font-heading text-[19px] font-semibold text-navy mb-1">No staff members yet</p>
            <p className="text-[13px] text-muted mb-5">Add up to 5 staff profiles on the Free plan.</p>
            <button onClick={openAdd} className="border border-[#E2DFD8] rounded-[9px] px-[18px] py-2 text-[13px] font-semibold text-[#2D2D2D] hover:border-navy hover:text-navy transition-colors">
              + Add Staff Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((s, i) => {
              const initials = (s.first_name[0] + s.last_name[0]).toUpperCase();
              return (
                <div key={s.id} className="bg-white border border-[#E2DFD8] rounded-[11px] p-5 text-center">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white flex items-center justify-center font-heading text-[17px] font-semibold mx-auto mb-2.5`}>
                    {initials}
                  </div>
                  <h4 className="text-[14px] font-semibold text-navy">{s.first_name} {s.last_name}</h4>
                  <div className="text-[12px] text-muted">{s.role}</div>
                  {s.email && <div className="text-[11px] text-muted mt-1">{s.email}</div>}

                  {/* Credentials — locked / greyed */}
                  <div className="mt-3.5 pt-3.5 border-t border-[#E2DFD8] opacity-35">
                    <div className="text-[10px] text-muted mb-1.5">🔒 Credentials locked</div>
                    <div className="flex gap-1 flex-wrap justify-center">
                      {["CPR/FA", "Background", "Training"].map(pill => (
                        <span key={pill} className="text-[10px] px-2 py-0.5 rounded-full bg-cream text-muted">{pill}</span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#E2DFD8]">
                    <button onClick={() => openEdit(s)} className="flex-1 py-1.5 text-[12px] text-muted hover:text-navy border border-[#E2DFD8] rounded-[6px] hover:border-navy transition-colors">Edit</button>
                    <button onClick={() => deleteStaff(s.id)} className="flex-1 py-1.5 text-[12px] text-red-400 hover:text-red-600 border border-[#E2DFD8] rounded-[6px] hover:border-red-300 transition-colors">Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Gate */}
        <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[18px] py-3.5 flex flex-wrap items-center gap-3">
          <span className="text-[16px]">🔒</span>
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-[13px] font-semibold text-navy">Track Staff Credentials & Expiration Dates</h4>
            <p className="text-[12px] text-muted">Monitor CPR certs, background screenings, training hours, and more. Available on Basic.</p>
          </div>
          <SeePlansButton className="shrink-0 bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">
            See Plans
          </SeePlansButton>
        </div>

        {atLimit && (
          <div className="text-center text-[12px] text-muted">
            Staff limit reached (5/5). <SeePlansButton className="text-gold font-semibold hover:text-[#A87D42]">Upgrade for unlimited staff →</SeePlansButton>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[18px] p-8 w-full max-w-[460px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-[22px] font-semibold text-navy mb-5 text-center">{editing ? "Edit Staff Member" : "Add Staff Member"}</h2>
            {error && <p className="text-[13px] text-red-600 mb-4">{error}</p>}
            <div className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-navy mb-1.5">Full Name *</label>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="First" className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
                  <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Last" className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-navy mb-1.5">Role *</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy bg-white">
                  <option value="">Select role…</option>
                  {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-navy mb-1.5">Email (optional)</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="staff@yourprogram.com" className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-navy mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-navy mb-1.5">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-[#E2DFD8] rounded-[9px] py-3 text-[14px] font-semibold text-[#2D2D2D] hover:border-navy transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-navy text-white rounded-[9px] py-3 text-[14px] font-semibold disabled:opacity-50 hover:bg-[#143A52] transition-colors">
                {saving ? "Saving…" : editing ? "Save Changes" : "Add Staff Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

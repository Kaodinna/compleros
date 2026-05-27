"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/dashboard/Header";
import SeePlansButton from "@/components/dashboard/SeePlansButton";
import ConfirmModal from "@/components/ConfirmModal";

const LICENSE_TYPES = [
  "DCF Childcare Facility License",
  "DOH Health Permit",
  "DBPR Business License",
  "School Registration",
  "VPK Provider Certificate",
  "Gold Seal Quality Care",
  "Other",
];

interface License {
  id: string;
  license_type: string;
  license_number: string | null;
  issuing_agency: string | null;
  issued_at: string | null;
  expires_at: string;
  renewal_notes: string | null;
}

function daysUntil(dateStr: string) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - now.getTime()) / 86400000);
}

const blankForm = { license_type: "", license_number: "", issuing_agency: "", issued_at: "", expires_at: "", renewal_notes: "" };

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<License | null>(null);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [planType, setPlanType] = useState("free");
  const [renewalNotes, setRenewalNotes] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: lics }, { data: profile }] = await Promise.all([
      supabase.from("licenses").select("*").eq("user_id", user.id).order("expires_at"),
      supabase.from("profiles").select("plan_type").eq("id", user.id).single(),
    ]);
    setLicenses(lics ?? []);
    setPlanType(profile?.plan_type ?? "free");
    // Initialize renewal notes state from DB
    const notes: Record<string, string> = {};
    (lics ?? []).forEach(l => { notes[l.id] = l.renewal_notes ?? ""; });
    setRenewalNotes(notes);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const saveNotes = async (licId: string) => {
    await supabase.from("licenses").update({ renewal_notes: renewalNotes[licId] || null }).eq("id", licId);
  };

  const openAdd = () => {
    setEditing(null); setForm(blankForm); setError(""); setShowModal(true);
  };
  const openEdit = (lic: License) => {
    setEditing(lic);
    setForm({ license_type: lic.license_type, license_number: lic.license_number ?? "", issuing_agency: lic.issuing_agency ?? "", issued_at: lic.issued_at ?? "", expires_at: lic.expires_at, renewal_notes: lic.renewal_notes ?? "" });
    setError(""); setShowModal(true);
  };

  const save = async () => {
    if (!form.license_type || !form.expires_at) { setError("License type and expiration date are required."); return; }
    setSaving(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = { user_id: user.id, license_type: form.license_type, license_number: form.license_number.trim() || null, issuing_agency: form.issuing_agency.trim() || null, issued_at: form.issued_at || null, expires_at: form.expires_at, renewal_notes: form.renewal_notes.trim() || null };
    let err;
    if (editing) {
      ({ error: err } = await supabase.from("licenses").update(payload).eq("id", editing.id));
    } else {
      ({ error: err } = await supabase.from("licenses").insert(payload));
      if (!err) await supabase.from("activity_log").insert({ user_id: user.id, icon: "📋", description: `Added ${form.license_type}` });
    }
    if (err) { setError(err.message); } else { setShowModal(false); load(); }
    setSaving(false);
  };

  const deleteLicense = async (id: string) => {
    await supabase.from("licenses").delete().eq("id", id);
    setConfirmDeleteId(null);
    load();
  };

  const isFree = planType === "free";
  const canAdd = !isFree || licenses.length < 1;

  return (
    <>
      <Header title="License & Permit Tracker" />
      <div className="p-4 sm:p-[24px_28px] space-y-4">

        {loading ? (
          <div className="text-center py-16 text-[13px] text-muted">Loading…</div>
        ) : licenses.length === 0 ? (
          <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-12 text-center">
            <div className="text-[32px] mb-3">📋</div>
            <p className="font-heading text-[19px] font-semibold text-navy mb-1">No licenses yet</p>
            <p className="text-[13px] text-muted mb-5">Add your facility license to start tracking renewal dates.</p>
            <button onClick={openAdd} className="border border-[#E2DFD8] rounded-[9px] px-[18px] py-2 text-[13px] font-semibold text-[#2D2D2D] hover:border-navy hover:text-navy transition-colors">
              + Add License
            </button>
          </div>
        ) : (
          <>
            {licenses.map(lic => {
              const days = daysUntil(lic.expires_at);
              const isExpired = days < 0;
              const isExpiring = !isExpired && days <= 60;
              const statusColor = isExpired ? "#C0392B" : isExpiring ? "#C4985A" : "#2E7D52";
              const statusLabel = isExpired ? "Expired" : isExpiring ? "Expiring Soon" : "Active";
              const statusBg = isExpired ? "bg-[#FEF2F2] text-[#C0392B]" : isExpiring ? "bg-[#FFFBF0] text-[#A87D42]" : "bg-[#ECFDF5] text-[#2E7D52]";

              return (
                <div key={lic.id} className="bg-white border border-[#E2DFD8] rounded-[12px] p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-[18px]">
                    <div>
                      <div className="font-heading text-[19px] font-semibold text-navy">{lic.license_type}</div>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold mt-1.5 ${statusBg}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-heading text-[38px] font-bold leading-none" style={{ color: statusColor }}>
                        {isExpired ? "0" : Math.abs(days)}
                      </div>
                      <div className="text-[12px] text-muted">days remaining</div>
                    </div>
                  </div>

                  {/* Fields grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-[0.5px]">License Number</label>
                      <div className="text-[13px] text-[#2D2D2D] font-medium mt-1">{lic.license_number || "—"}</div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-[0.5px]">Issuing Agency</label>
                      <div className="text-[13px] text-[#2D2D2D] font-medium mt-1">{lic.issuing_agency || "—"}</div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-[0.5px]">Issue Date</label>
                      <div className="text-[13px] text-[#2D2D2D] font-medium mt-1">
                        {lic.issued_at ? new Date(lic.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-[0.5px]">Expiration Date</label>
                      <div className="text-[13px] font-medium mt-1" style={{ color: statusColor }}>
                        {new Date(lic.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  {/* Renewal Notes */}
                  <div className="mt-1">
                    <label className="block text-[12px] font-semibold text-navy mb-1.5">Renewal Notes</label>
                    <textarea
                      value={renewalNotes[lic.id] ?? ""}
                      onChange={e => setRenewalNotes(n => ({ ...n, [lic.id]: e.target.value }))}
                      onBlur={() => saveNotes(lic.id)}
                      rows={2}
                      placeholder="Add notes about your renewal process..."
                      className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] text-[#2D2D2D] placeholder:text-muted/60 focus:outline-none focus:border-navy resize-vertical min-h-[70px]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => openEdit(lic)} className="border border-[#E2DFD8] rounded-[9px] px-[18px] py-2 text-[12px] font-semibold text-[#2D2D2D] hover:border-navy hover:text-navy transition-colors">
                      ✏️ Edit License
                    </button>
                    <button onClick={() => setConfirmDeleteId(lic.id)} className="border border-[#E2DFD8] rounded-[9px] px-[18px] py-2 text-[12px] text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Add Another License */}
        {canAdd && licenses.length > 0 && (
          <button
            onClick={openAdd}
            className="w-full border-2 border-dashed border-[#E2DFD8] rounded-[12px] p-7 text-center cursor-pointer hover:border-gold hover:bg-[#FFFBF0] transition-colors"
          >
            <div className="text-[22px] text-muted mb-1.5">📋</div>
            <div className="text-[13px] text-muted">Add Another License</div>
          </button>
        )}
        {!canAdd && (
          <button
            onClick={() => {}}
            className="w-full border-2 border-dashed border-[#E2DFD8] rounded-[12px] p-7 text-center cursor-pointer hover:border-gold hover:bg-[#FFFBF0] transition-colors"
            disabled
          >
            <div className="text-[22px] text-muted mb-1.5">📋</div>
            <div className="text-[13px] text-muted">Add Another License</div>
          </button>
        )}

        {/* Upgrade Gate */}
        <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[18px] py-3.5 flex flex-wrap items-center gap-3">
          <span className="text-[16px]">🔒</span>
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-[13px] font-semibold text-navy">Track Unlimited Licenses</h4>
            <p className="text-[12px] text-muted">Monitor every license, permit, and registration in one place. Available on Basic.</p>
          </div>
          <SeePlansButton className="shrink-0 bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">
            See Plans
          </SeePlansButton>
        </div>

        {/* License History */}
        <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-[22px]">
          <div className="font-heading text-[16px] font-semibold text-navy mb-3">License History</div>
          <div className="text-center py-6 text-muted">
            <div className="text-[24px] mb-2">📜</div>
            <div className="text-[13px]">Past license records will appear here as you renew.</div>
            <div className="text-[12px] mt-1">Compleros keeps your full compliance history.</div>
          </div>
        </div>
      </div>

      {confirmDeleteId && (
        <ConfirmModal
          title="Delete License"
          message="Are you sure you want to delete this license? This cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => deleteLicense(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[18px] p-8 w-full max-w-[460px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-[22px] font-semibold text-navy mb-5 text-center">{editing ? "Edit License" : "Add License"}</h2>
            {error && <p className="text-[13px] text-red-600 mb-4">{error}</p>}
            <div className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-navy mb-1.5">License Type *</label>
                <select value={form.license_type} onChange={e => setForm(f => ({ ...f, license_type: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] text-[#2D2D2D] focus:outline-none focus:border-navy bg-white">
                  <option value="">Select type…</option>
                  {LICENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-navy mb-1.5">License Number</label>
                <input value={form.license_number} onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))} placeholder="e.g., C12FL0456" className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-navy mb-1.5">Issuing Agency</label>
                <input value={form.issuing_agency} onChange={e => setForm(f => ({ ...f, issuing_agency: e.target.value }))} placeholder="e.g., FL Dept. of Children & Families" className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-navy mb-1.5">Issue Date</label>
                  <input type="date" value={form.issued_at} onChange={e => setForm(f => ({ ...f, issued_at: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-navy mb-1.5">Expiration Date *</label>
                  <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-[#E2DFD8] rounded-[9px] py-3 text-[14px] font-semibold text-[#2D2D2D] hover:border-navy hover:text-navy transition-colors">Cancel</button>
              <button onClick={save} disabled={saving || !form.license_type || !form.expires_at} className="flex-1 bg-navy text-white rounded-[9px] py-3 text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#143A52] transition-colors">
                {saving ? "Saving…" : editing ? "Save Changes" : "Add License"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

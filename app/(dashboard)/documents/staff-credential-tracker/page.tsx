"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/dashboard/Header";
import Link from "next/link";

const STORAGE_KEY = "compleros-template-staff-credential-tracker";
const DOC_ID = "CMP-TMP-STF-001";

interface StaffRow {
  id: string;
  name: string;
  role: string;
  hireDate: string;
  screenDate: string;
  cprDate: string;
  cprExp: string;
  faDate: string;
  faExp: string;
  training45: string;
  inServiceHrs: string;
  dirCred: string;
  notes: string;
}

function emptyRow(): StaffRow {
  return { id: `${Date.now()}-${Math.random()}`, name: "", role: "", hireDate: "", screenDate: "", cprDate: "", cprExp: "", faDate: "", faExp: "", training45: "", inServiceHrs: "", dirCred: "", notes: "" };
}

type StatusCls = "current" | "expiring" | "expired" | "complete" | "in-progress" | "empty";
interface Status { label: string; cls: StatusCls; }

function calcScreenExp(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear() + 5}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function calcDateStatus(expStr: string): Status {
  if (!expStr) return { label: "—", cls: "empty" };
  const exp = new Date(expStr + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = (exp.getTime() - today.getTime()) / 86400000;
  if (diff < 0) return { label: "EXPIRED", cls: "expired" };
  if (diff < 30) return { label: "EXPIRING", cls: "expiring" };
  return { label: "CURRENT", cls: "current" };
}

function calcInService(hrs: string): Status {
  if (hrs === "" || hrs === undefined) return { label: "—", cls: "empty" };
  const h = parseFloat(hrs);
  if (isNaN(h)) return { label: "—", cls: "empty" };
  if (h >= 10) return { label: "COMPLETE", cls: "complete" };
  if (h > 0) return { label: "IN PROGRESS", cls: "in-progress" };
  return { label: "—", cls: "empty" };
}

function fmtDate(d: string): string {
  if (!d) return "";
  const p = d.split("-");
  return `${p[1]}/${p[2]}/${p[0]}`;
}

const STATUS_CLASSES: Record<StatusCls, string> = {
  current:     "bg-[#E8F5E9] text-[#2E7D32]",
  expiring:    "bg-[#FEF3C7] text-[#B45309]",
  expired:     "bg-[#FEE2E2] text-[#B91C1C]",
  complete:    "bg-[#E8F5E9] text-[#2E7D32]",
  "in-progress": "bg-[#FEF3C7] text-[#B45309]",
  empty:       "bg-[#F7F5F0] text-[#94A3B8]",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block px-2.5 py-[3px] rounded-full text-[10.5px] font-bold tracking-[0.3px] whitespace-nowrap w-full text-center ${STATUS_CLASSES[status.cls]}`}>
      {status.label}
    </span>
  );
}

function buildPrintDocument(rows: StaffRow[], today: string): string {
  const esc = (s: string | undefined | null) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));

  const filled = rows.filter((r) => r.name.trim());

  const badgeStyle = (cls: StatusCls) => {
    const styles: Record<StatusCls, string> = {
      current: "background:#E8F5E9;color:#2E7D32",
      expiring: "background:#FEF3C7;color:#B45309",
      expired: "background:#FEE2E2;color:#B91C1C",
      complete: "background:#E8F5E9;color:#2E7D32",
      "in-progress": "background:#FEF3C7;color:#B45309",
      empty: "background:#F7F5F0;color:#94A3B8",
    };
    return styles[cls];
  };

  const trs = filled.map((r) => {
    const se = calcScreenExp(r.screenDate);
    const ss = calcDateStatus(se);
    const cs = calcDateStatus(r.cprExp);
    const fs = calcDateStatus(r.faExp);
    const is2 = calcInService(r.inServiceHrs);
    return `<tr>
      <td style="text-align:left;font-weight:600;white-space:nowrap">${esc(r.name)}</td>
      <td>${esc(r.role)}</td>
      <td>${fmtDate(r.hireDate)}</td>
      <td>${fmtDate(r.screenDate)}</td>
      <td>${fmtDate(se)}</td>
      <td><span style="display:inline-block;padding:2px 6px;border-radius:100px;font-size:8px;font-weight:700;${badgeStyle(ss.cls)}">${ss.label}</span></td>
      <td>${fmtDate(r.cprDate)}</td>
      <td>${fmtDate(r.cprExp)}</td>
      <td><span style="display:inline-block;padding:2px 6px;border-radius:100px;font-size:8px;font-weight:700;${badgeStyle(cs.cls)}">${cs.label}</span></td>
      <td>${fmtDate(r.faDate)}</td>
      <td>${fmtDate(r.faExp)}</td>
      <td><span style="display:inline-block;padding:2px 6px;border-radius:100px;font-size:8px;font-weight:700;${badgeStyle(fs.cls)}">${fs.label}</span></td>
      <td>${fmtDate(r.training45)}</td>
      <td style="text-align:center">${esc(r.inServiceHrs)}</td>
      <td><span style="display:inline-block;padding:2px 6px;border-radius:100px;font-size:8px;font-weight:700;${badgeStyle(is2.cls)}">${is2.label}</span></td>
      <td style="text-align:center">${esc(r.dirCred) || "—"}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Staff Credential Tracking Sheet · Compleros</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #2D3748; font-size: 9px; }
    @page { size: letter landscape; margin: 10mm 12mm; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 4px 5px; border: 1px solid #E5E1D8; text-align: center; vertical-align: middle; }
    th { background: #1B4D6B; color: white; font-size: 8px; font-weight: 700; }
    .cat-th { background: #F0EDE6; color: #C4985A; font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    tr:nth-child(even) { background: #F8F6F1; }
  </style>
</head>
<body>
  <table style="border:none;border-bottom:2px solid #C4985A;margin-bottom:12px">
    <tr>
      <td style="border:none;font-size:20px;font-weight:700;color:#1B4D6B;text-align:left;padding:0">Compleros</td>
      <td style="border:none;text-align:right;padding:0">
        <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#C4985A;margin-bottom:2px">Staff Management Template</div>
        <div style="font-size:14px;font-weight:700;color:#1B4D6B">Staff Credential Tracking Sheet</div>
      </td>
    </tr>
  </table>
  <table>
    <thead>
      <tr>
        <th class="cat-th" colspan="3">Basic Info</th>
        <th class="cat-th" colspan="3">Background Screening</th>
        <th class="cat-th" colspan="3">CPR Certification</th>
        <th class="cat-th" colspan="3">First Aid</th>
        <th class="cat-th">45-Hr</th>
        <th class="cat-th" colspan="2">In-Service</th>
        <th class="cat-th">Dir.</th>
      </tr>
      <tr>
        <th>Staff Name</th><th>Role</th><th>Hire</th>
        <th>Screen Date</th><th>Expiration</th><th>Status</th>
        <th>CPR Date</th><th>Expiration</th><th>Status</th>
        <th>FA Date</th><th>Expiration</th><th>Status</th>
        <th>Completed</th>
        <th>Hours</th><th>Status</th>
        <th>Cred?</th>
      </tr>
    </thead>
    <tbody>${trs}</tbody>
  </table>
  <table style="border:none;border-top:2px solid #C4985A;margin-top:16px">
    <tr>
      <td style="border:none;font-size:8px;color:#94A3B8;text-align:left;padding:6px 0 0">${esc(DOC_ID)} · Generated ${today}</td>
      <td style="border:none;font-size:8px;color:#94A3B8;text-align:right;padding:6px 0 0">Compleros · Compliance Management for Florida Education Providers</td>
    </tr>
  </table>
  <script>window.onload = function () { setTimeout(function () { window.print(); }, 300); }</script>
</body>
</html>`;
}

export default function StaffCredentialTrackerPage() {
  const [rows, setRows] = useState<StaffRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [showReset, setShowReset] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: StaffRow[] = JSON.parse(raw);
        if (data.length) setRows(data);
      }
    } catch {}
  }, []);

  const persist = useCallback((next: StaffRow[]) => {
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      setSaveStatus("saved");
    }, 300);
  }, []);

  const updateCell = useCallback((idx: number, field: keyof StaffRow, value: string) => {
    setRows((prev) => {
      const next = prev.map((r, i) => i === idx ? { ...r, [field]: value } : r);
      persist(next);
      return next;
    });
  }, [persist]);

  const addRow = () => {
    setRows((prev) => { const next = [...prev, emptyRow()]; persist(next); return next; });
  };

  const removeRow = (idx: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => { const next = prev.filter((_, i) => i !== idx); persist(next); return next; });
  };

  const resetAll = () => {
    const next = [emptyRow(), emptyRow(), emptyRow()];
    setRows(next);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setShowReset(false);
  };

  const downloadPDF = () => {
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const html = buildPrintDocument(rows, today);
    const win = window.open("", "_blank");
    if (!win) { alert("Allow pop-ups for this site to save as PDF."); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  // Summary
  const filled = rows.filter((r) => r.name.trim());
  let current = 0, expiring = 0, expired = 0;
  filled.forEach((r) => {
    [calcDateStatus(calcScreenExp(r.screenDate)), calcDateStatus(r.cprExp), calcDateStatus(r.faExp)].forEach((s) => {
      if (s.cls === "current") current++;
      if (s.cls === "expiring") expiring++;
      if (s.cls === "expired") expired++;
    });
  });

  const thClass = "bg-navy text-white px-2.5 py-[9px] text-[10.5px] font-semibold text-center whitespace-nowrap sticky top-0 z-10 border-r border-[rgba(255,255,255,0.08)]";
  const catThClass = "bg-cream text-[#C4985A] text-[8.5px] font-bold tracking-[1.2px] uppercase px-2 py-1.5 text-center border-b border-[#E5E1D8] border-r border-r-[#E5E1D8]";
  const tdClass = "px-1.5 py-1 border-b border-[#EEEAE1] border-r border-r-[#EEEAE1] align-middle";
  const inputClass = "w-full border border-transparent bg-transparent px-2 py-[6px] rounded-[6px] text-[12.5px] font-[inherit] text-[#2D3748] transition-all hover:bg-[#F7F5F0] focus:outline-none focus:border-[#2A6A8F] focus:bg-white focus:shadow-[0_0_0_2px_rgba(27,77,107,0.08)]";

  return (
    <>
      <Header title="Staff Credential Tracking Sheet" />

      {/* Action bar */}
      <div className="bg-white border-b border-[#E2DFD8] px-4 sm:px-8 py-3 flex flex-wrap items-center gap-3 sticky top-[60px] z-20 shadow-sm">
        <Link href="/documents" className="flex items-center gap-1.5 text-[13px] text-muted hover:text-navy transition-colors shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Templates
        </Link>
        <span className="text-muted/40 text-[13px]">/</span>
        <span className="text-[13px] text-navy font-medium hidden sm:block">Staff Credential Tracking Sheet</span>

        {/* Summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[12px] font-semibold border border-[#E2DFD8]">
            <span className="font-bold text-navy">{filled.length}</span> staff
          </span>
          {current > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[12px] font-semibold bg-[#E8F5E9] border border-[rgba(46,125,50,0.18)] text-[#2E7D32]">
              <span className="font-bold">{current}</span> current
            </span>
          )}
          {expiring > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[12px] font-semibold bg-[#FEF3C7] border border-[rgba(180,83,9,0.18)] text-[#B45309]">
              <span className="font-bold">{expiring}</span> expiring
            </span>
          )}
          {expired > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[12px] font-semibold bg-[#FEE2E2] border border-[rgba(185,28,28,0.18)] text-[#B91C1C]">
              <span className="font-bold">{expired}</span> expired
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Save status */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border ${saveStatus === "saving" ? "bg-[#FEF3C7] border-[rgba(180,83,9,0.2)] text-[#B45309]" : "bg-[#E8F5E9] border-[rgba(46,125,50,0.18)] text-[#2E7D32]"}`}>
          {saveStatus === "saving" ? "Saving…" : "Saved"}
        </div>

        <button onClick={() => setShowReset(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12.5px] font-semibold text-muted hover:text-red-600 hover:bg-red-50 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Start Over
        </button>
        <a href="/Compleros_Staff_Credential_Tracking_Sheet.xlsx" download className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2DFD8] rounded-[7px] text-[12.5px] font-semibold text-navy hover:border-navy hover:bg-[#E8EEF2] transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          Blank XLSX
        </a>
        <button onClick={downloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C4985A] text-white rounded-[7px] text-[12.5px] font-semibold hover:bg-[#B88A4E] transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download PDF
        </button>
      </div>

      {/* Page body */}
      <div className="p-4 sm:p-8 pb-20">

        {/* Hero */}
        <div className="mb-6 pb-6 border-b border-[#EEEAE1]">
          <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#C4985A] mb-2">Staff Management Template</div>
          <h1 className="font-heading text-[26px] sm:text-[32px] text-navy leading-tight mb-2">Staff Credential Tracking Sheet</h1>
          <p className="text-[14px] text-muted leading-relaxed max-w-[700px]">
            Enter each staff member&apos;s credentials and dates below. Status badges auto-calculate — green means current, yellow means expiring within 30 days, red means expired. The Level 2 screening expiration auto-fills at 5 years from the screening date.
          </p>
          <div className="inline-flex items-center gap-2 mt-3.5 px-3.5 py-2 bg-[#E8E4DA] rounded-[8px] text-[12.5px] font-medium text-[#475569]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span><strong className="text-navy">Your work stays on this device.</strong> Compleros never sees or stores what you type here.</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E2DFD8] rounded-[14px] overflow-hidden shadow-sm mb-5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]" style={{ minWidth: "1400px" }}>
              <thead>
                {/* Category row */}
                <tr>
                  <th className={catThClass} colSpan={3}>Basic Info</th>
                  <th className={catThClass} colSpan={3}>Background Screening</th>
                  <th className={catThClass} colSpan={3}>CPR Certification</th>
                  <th className={catThClass} colSpan={3}>First Aid</th>
                  <th className={catThClass}>45-Hr Training</th>
                  <th className={catThClass} colSpan={2}>Annual In-Service</th>
                  <th className={catThClass}>Dir.</th>
                  <th className={catThClass}>Notes</th>
                  <th className={`${catThClass} border-r-0`} style={{ width: 36 }}></th>
                </tr>
                {/* Column headers */}
                <tr>
                  <th className={thClass}>Staff Name</th>
                  <th className={thClass}>Role</th>
                  <th className={thClass}>Hire Date</th>
                  <th className={thClass}>Screening Date</th>
                  <th className={thClass}>Expiration</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Cert Date</th>
                  <th className={thClass}>Expiration</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Cert Date</th>
                  <th className={thClass}>Expiration</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Completed</th>
                  <th className={thClass}>Hours</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Cred?</th>
                  <th className={thClass}>Notes</th>
                  <th className="bg-navy" style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const screenExp = calcScreenExp(r.screenDate);
                  const screenSt = calcDateStatus(screenExp);
                  const cprSt = calcDateStatus(r.cprExp);
                  const faSt = calcDateStatus(r.faExp);
                  const isSt = calcInService(r.inServiceHrs);
                  const even = i % 2 === 1;
                  const rowBg = even ? "bg-[rgba(240,237,230,0.3)]" : "";
                  return (
                    <tr key={r.id} className={`${rowBg} hover:bg-[rgba(27,77,107,0.02)]`}>
                      <td className={tdClass}>
                        <input value={r.name} onChange={(e) => updateCell(i, "name", e.target.value)} placeholder="Full name" className={`${inputClass} min-w-[150px] font-medium`} />
                      </td>
                      <td className={tdClass}>
                        <input value={r.role} onChange={(e) => updateCell(i, "role", e.target.value)} placeholder="e.g., Lead Teacher" className={`${inputClass} min-w-[120px]`} />
                      </td>
                      <td className={tdClass}>
                        <input type="date" value={r.hireDate} onChange={(e) => updateCell(i, "hireDate", e.target.value)} className={`${inputClass} min-w-[130px]`} />
                      </td>
                      <td className={tdClass}>
                        <input type="date" value={r.screenDate} onChange={(e) => updateCell(i, "screenDate", e.target.value)} className={`${inputClass} min-w-[130px]`} />
                      </td>
                      <td className={`${tdClass} text-center text-[12px] text-muted whitespace-nowrap`}>
                        {fmtDate(screenExp) || <span className="text-[#CBD5E1]">auto</span>}
                      </td>
                      <td className={`${tdClass} min-w-[90px]`}><StatusBadge status={screenSt} /></td>
                      <td className={tdClass}>
                        <input type="date" value={r.cprDate} onChange={(e) => updateCell(i, "cprDate", e.target.value)} className={`${inputClass} min-w-[130px]`} />
                      </td>
                      <td className={tdClass}>
                        <input type="date" value={r.cprExp} onChange={(e) => updateCell(i, "cprExp", e.target.value)} className={`${inputClass} min-w-[130px]`} />
                      </td>
                      <td className={`${tdClass} min-w-[90px]`}><StatusBadge status={cprSt} /></td>
                      <td className={tdClass}>
                        <input type="date" value={r.faDate} onChange={(e) => updateCell(i, "faDate", e.target.value)} className={`${inputClass} min-w-[130px]`} />
                      </td>
                      <td className={tdClass}>
                        <input type="date" value={r.faExp} onChange={(e) => updateCell(i, "faExp", e.target.value)} className={`${inputClass} min-w-[130px]`} />
                      </td>
                      <td className={`${tdClass} min-w-[90px]`}><StatusBadge status={faSt} /></td>
                      <td className={tdClass}>
                        <input type="date" value={r.training45} onChange={(e) => updateCell(i, "training45", e.target.value)} className={`${inputClass} min-w-[130px]`} />
                      </td>
                      <td className={tdClass}>
                        <input type="number" min="0" max="100" step="0.5" value={r.inServiceHrs} onChange={(e) => updateCell(i, "inServiceHrs", e.target.value)} placeholder="0" className={`${inputClass} min-w-[60px] text-center`} />
                      </td>
                      <td className={`${tdClass} min-w-[100px]`}><StatusBadge status={isSt} /></td>
                      <td className={tdClass}>
                        <select value={r.dirCred} onChange={(e) => updateCell(i, "dirCred", e.target.value)} className={`${inputClass} min-w-[60px] cursor-pointer`}>
                          <option value="">—</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                      <td className={tdClass}>
                        <input value={r.notes} onChange={(e) => updateCell(i, "notes", e.target.value)} placeholder="Notes…" className={`${inputClass} min-w-[160px]`} />
                      </td>
                      <td className={`${tdClass} border-r-0 text-center`} style={{ width: 36 }}>
                        <button
                          onClick={() => removeRow(i)}
                          title="Remove"
                          className="text-[#CBD5E1] hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center p-4 border-t border-dashed border-[#E2DFD8]">
            <button
              onClick={addRow}
              className="inline-flex items-center gap-2 bg-transparent border border-dashed border-[#E2DFD8] text-navy px-5 py-2.5 rounded-[8px] text-[13px] font-semibold hover:border-[#C4985A] hover:bg-[#EFE4D0] hover:text-[#C4985A] transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Staff Member
            </button>
          </div>
        </div>

        {/* Callout */}
        <div className="rounded-[12px] px-6 py-5 bg-[#F0EDE6] border border-[rgba(196,152,90,0.3)]" style={{ borderLeft: "4px solid #C4985A" }}>
          <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#C4985A] mb-2">Track this in Compleros</div>
          <p className="text-[14px] text-navy leading-relaxed">
            With a Basic plan, Compleros automatically alerts you before any credential expires — 90, 60, 30, 14, and 7 days out. No more manual checking.
          </p>
        </div>
      </div>

      {/* Reset modal */}
      {showReset && (
        <div className="fixed inset-0 bg-[rgba(19,58,82,0.5)] backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowReset(false)}>
          <div className="bg-white rounded-[14px] p-7 max-w-[420px] w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-[22px] text-navy mb-2.5">Start over?</h3>
            <p className="text-[14px] text-muted leading-relaxed mb-6">This clears all staff data from this template on this device. This action cannot be undone.</p>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setShowReset(false)} className="px-4 py-2 border border-[#E2DFD8] rounded-[8px] text-[13px] font-semibold text-navy hover:border-navy transition-colors">Cancel</button>
              <button onClick={resetAll} className="px-4 py-2 bg-red-600 text-white rounded-[8px] text-[13px] font-semibold hover:bg-red-700 transition-colors">Yes, start over</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

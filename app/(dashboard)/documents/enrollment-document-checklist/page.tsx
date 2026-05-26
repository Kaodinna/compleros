"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/dashboard/Header";
import Link from "next/link";

const STORAGE_KEY = "compleros-template-enrollment-document-checklist";
const DOC_ID = "CMP-TMP-EDC-001";

const DOCS = ["ecf", "paf", "imm", "health", "birth", "residency", "custody"] as const;
type DocKey = typeof DOCS[number];
type DocStatus = "" | "on-file" | "missing" | "na";
const STATES: DocStatus[] = ["", "on-file", "missing", "na"];
const STATE_LABELS: Record<DocStatus, string> = { "": "Click", "on-file": "On File", "missing": "Missing", "na": "N/A" };

const DOC_LABELS: Record<DocKey, string> = {
  ecf:       "Emergency Contact",
  paf:       "Parent Auth",
  imm:       "Immunization (680)",
  health:    "Health Exam (3040)",
  birth:     "Birth Certificate",
  residency: "Proof of Residency",
  custody:   "Custody / Court Orders",
};

interface ChildRow {
  id: string;
  name: string;
  enrolled: string;
  ecf: DocStatus;
  paf: DocStatus;
  imm: DocStatus;
  health: DocStatus;
  birth: DocStatus;
  residency: DocStatus;
  custody: DocStatus;
}

function emptyRow(): ChildRow {
  return { id: `${Date.now()}-${Math.random()}`, name: "", enrolled: "", ecf: "", paf: "", imm: "", health: "", birth: "", residency: "", custody: "" };
}

function getOverall(r: ChildRow): "complete" | "incomplete" | "" {
  if (!r.name.trim()) return "";
  const vals = DOCS.map((d) => r[d]);
  if (vals.some((v) => v === "missing")) return "incomplete";
  if (vals.filter((v) => v === "on-file").length >= 1) return "complete";
  return "";
}

function fmtDate(d: string): string {
  if (!d) return "";
  const p = d.split("-");
  if (p.length < 3) return d;
  return `${p[1]}/${p[2]}/${p[0]}`;
}

function buildPrintDocument(rows: ChildRow[], today: string): string {
  const esc = (s: string | undefined | null) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));

  const badgeStyle = (v: DocStatus) => {
    if (v === "on-file")  return "background:#E8F5E9;color:#2E7D32";
    if (v === "missing")  return "background:#FEE2E2;color:#B91C1C";
    if (v === "na")       return "background:#F1F5F9;color:#94A3B8";
    return "";
  };

  const filled = rows.filter((r) => r.name.trim());
  const trs = filled.map((r) => {
    const overall = getOverall(r);
    let html = `<td style="text-align:left;font-weight:500">${esc(r.name)}</td><td>${fmtDate(r.enrolled)}</td>`;
    DOCS.forEach((d) => {
      const v = r[d];
      html += v
        ? `<td><span style="display:inline-block;padding:2px 6px;border-radius:100px;font-size:8px;font-weight:700;${badgeStyle(v)}">${STATE_LABELS[v]}</span></td>`
        : `<td style="color:#94A3B8">—</td>`;
    });
    html += overall === "complete"
      ? `<td><span style="display:inline-block;padding:2px 6px;border-radius:100px;font-size:8px;font-weight:700;background:#E8F5E9;color:#2E7D32">COMPLETE</span></td>`
      : overall === "incomplete"
      ? `<td><span style="display:inline-block;padding:2px 6px;border-radius:100px;font-size:8px;font-weight:700;background:#FEE2E2;color:#B91C1C">INCOMPLETE</span></td>`
      : `<td style="color:#94A3B8">—</td>`;
    return `<tr>${html}</tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Enrollment Document Checklist · Compleros</title>
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { font-family:Arial,Helvetica,sans-serif;color:#2D3748;font-size:9px; }
    @page { size:letter landscape;margin:10mm 12mm; }
    @media print { * { -webkit-print-color-adjust:exact !important;print-color-adjust:exact !important; } }
    table { width:100%;border-collapse:collapse; }
    th { background:#1B4D6B;color:white;padding:5px 4px;font-size:8px;font-weight:700;text-align:center;border:1px solid #ccc; }
    td { padding:4px;border:1px solid #ddd;text-align:center;vertical-align:middle; }
    tr:nth-child(even) { background:#F8F6F1; }
    .cat { background:#F0EDE6;color:#C4985A;font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:1px; }
  </style>
</head>
<body>
  <table style="border:none;border-bottom:2px solid #C4985A;margin-bottom:12px">
    <tr>
      <td style="border:none;font-size:20px;font-weight:700;color:#1B4D6B;padding:0">Compleros</td>
      <td style="border:none;text-align:right;padding:0">
        <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#C4985A;margin-bottom:2px">Daily Operations Template</div>
        <div style="font-size:14px;font-weight:700;color:#1B4D6B">Enrollment Document Checklist</div>
      </td>
    </tr>
  </table>
  <table>
    <thead>
      <tr>
        <th class="cat" colspan="2">Child</th>
        <th class="cat" colspan="2">Compleros Templates</th>
        <th class="cat" colspan="2">State Forms</th>
        <th class="cat" colspan="3">Supporting Docs</th>
        <th class="cat">Overall</th>
      </tr>
      <tr>
        <th style="min-width:120px;text-align:left">Child&apos;s Name</th>
        <th>Enrolled</th>
        <th>Emergency Contact</th>
        <th>Parent Auth</th>
        <th>Immunization (680)</th>
        <th>Health Exam (3040)</th>
        <th>Birth Certificate</th>
        <th>Proof of Residency</th>
        <th>Custody / Court Orders</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${trs}</tbody>
  </table>
  <table style="border:none;border-top:2px solid #C4985A;margin-top:16px">
    <tr>
      <td style="border:none;font-size:8px;color:#94A3B8;text-align:left;padding:5px 0 0">${esc(DOC_ID)} · Generated ${today}</td>
      <td style="border:none;font-size:8px;color:#94A3B8;text-align:right;padding:5px 0 0">Compleros · Compliance Management for Florida Education Providers</td>
    </tr>
  </table>
  <script>window.onload = function () { setTimeout(function () { window.print(); }, 300); }</script>
</body>
</html>`;
}

const STATUS_STYLES: Record<DocStatus, string> = {
  "":         "bg-cream-warm text-muted border-dashed border-[#E5E1D8] font-medium",
  "on-file":  "bg-[#E8F5E9] text-[#2E7D32] border-[rgba(46,125,50,0.15)]",
  "missing":  "bg-[#FEE2E2] text-[#B91C1C] border-[rgba(185,28,28,0.15)]",
  "na":       "bg-[#F1F5F9] text-[#94A3B8] border-[rgba(100,116,139,0.15)]",
};

function StatusBadge({ value, onClick }: { value: DocStatus; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center px-2.5 py-[5px] rounded-full text-[11px] font-bold tracking-[0.3px] cursor-pointer border-[1.5px] transition-all hover:scale-105 min-w-[70px] ${STATUS_STYLES[value]}`}
    >
      {STATE_LABELS[value]}
    </button>
  );
}

export default function EnrollmentDocumentChecklistPage() {
  const [rows, setRows] = useState<ChildRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [showReset, setShowReset] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: ChildRow[] = JSON.parse(raw);
        if (data.length) setRows(data);
      }
    } catch {}
  }, []);

  const persist = useCallback((next: ChildRow[]) => {
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      setSaveStatus("saved");
    }, 300);
  }, []);

  const updateCell = useCallback((idx: number, field: keyof ChildRow, value: string) => {
    setRows((prev) => {
      const next = prev.map((r, i) => i === idx ? { ...r, [field]: value } : r);
      persist(next);
      return next;
    });
  }, [persist]);

  const cycleStatus = useCallback((idx: number, doc: DocKey) => {
    setRows((prev) => {
      const cur = prev[idx][doc];
      const ci = STATES.indexOf(cur);
      const next = prev.map((r, i) => i === idx ? { ...r, [doc]: STATES[(ci + 1) % STATES.length] } : r);
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
  const complete = filled.filter((r) => getOverall(r) === "complete").length;
  const incomplete = filled.filter((r) => getOverall(r) === "incomplete").length;

  const thClass = "bg-navy text-white px-2 py-[10px] text-[10.5px] font-semibold text-center whitespace-nowrap sticky top-0 z-10 border-r border-[rgba(255,255,255,0.08)]";
  const catThClass = "bg-cream text-[#C4985A] text-[8.5px] font-bold tracking-[1.2px] uppercase px-2 py-1.5 text-center border-b border-[#E5E1D8] border-r border-r-[#E5E1D8]";
  const tdClass = "px-1 py-1.5 border-b border-[#EEEAE1] border-r border-r-[#EEEAE1] align-middle text-center";
  const inputClass = "w-full border border-transparent bg-transparent px-2 py-[6px] rounded-[6px] text-[12.5px] font-[inherit] text-[#2D3748] transition-all hover:bg-[#F7F5F0] focus:outline-none focus:border-[#2A6A8F] focus:bg-white focus:shadow-[0_0_0_2px_rgba(27,77,107,0.08)]";

  return (
    <>
      <Header title="Enrollment Document Checklist" />

      {/* Action bar */}
      <div className="bg-white border-b border-[#E2DFD8] px-4 sm:px-8 py-3 flex flex-wrap items-center gap-3 sticky top-[60px] z-20 shadow-sm">
        <Link href="/documents" className="flex items-center gap-1.5 text-[13px] text-muted hover:text-navy transition-colors shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Templates
        </Link>
        <span className="text-muted/40 text-[13px]">/</span>
        <span className="text-[13px] text-navy font-medium hidden sm:block">Enrollment Document Checklist</span>

        {/* Summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[12px] font-semibold border border-[#E2DFD8]">
            <span className="font-bold text-navy">{filled.length}</span> children
          </span>
          {complete > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[12px] font-semibold bg-[#E8F5E9] border border-[rgba(46,125,50,0.18)] text-[#2E7D32]">
              <span className="font-bold">{complete}</span> complete
            </span>
          )}
          {incomplete > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[12px] font-semibold bg-[#FEE2E2] border border-[rgba(185,28,28,0.18)] text-[#B91C1C]">
              <span className="font-bold">{incomplete}</span> incomplete
            </span>
          )}
        </div>

        <div className="flex-1" />

        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border ${saveStatus === "saving" ? "bg-[#FEF3C7] border-[rgba(180,83,9,0.2)] text-[#B45309]" : "bg-[#E8F5E9] border-[rgba(46,125,50,0.18)] text-[#2E7D32]"}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {saveStatus === "saving" ? "Saving…" : "All changes saved"}
        </div>

        <button onClick={() => setShowReset(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12.5px] font-semibold text-muted hover:text-red-600 hover:bg-red-50 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Start Over
        </button>
        <a href="/Compleros_Enrollment_Document_Checklist.xlsx" download className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2DFD8] rounded-[7px] text-[12.5px] font-semibold text-navy hover:border-navy hover:bg-[#E8EEF2] transition-colors">
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
          <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#C4985A] mb-2">Daily Operations Template</div>
          <h1 className="font-heading text-[26px] sm:text-[32px] text-navy leading-tight mb-2">Enrollment Document Checklist</h1>
          <p className="text-[14px] text-muted leading-relaxed max-w-[780px]">
            Track which enrollment documents are on file for each child. Click any status badge to cycle through: On File → Missing → N/A. The overall status auto-calculates — if any document is missing, the child&apos;s file is incomplete.
          </p>
          <div className="inline-flex items-center gap-2 mt-3.5 px-3.5 py-2 bg-[#E8E4DA] rounded-[8px] text-[12.5px] font-medium text-[#475569]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span><strong className="text-navy">Status only — no documents stored.</strong> Compleros tracks whether a form is on file, never the form itself.</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E2DFD8] rounded-[14px] overflow-hidden shadow-sm mb-5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]" style={{ minWidth: "1100px" }}>
              <thead>
                {/* Category row */}
                <tr>
                  <th className={catThClass} colSpan={2}>Child</th>
                  <th className={catThClass} colSpan={2}>Compleros Templates</th>
                  <th className={catThClass} colSpan={2}>State Forms</th>
                  <th className={catThClass} colSpan={3}>Supporting Docs</th>
                  <th className={catThClass}>Overall</th>
                  <th className={`${catThClass} border-r-0`} style={{ width: 36 }} />
                </tr>
                {/* Column headers */}
                <tr>
                  <th className={thClass} style={{ minWidth: 160, textAlign: "left", paddingLeft: 12 }}>Child&apos;s Name</th>
                  <th className={thClass}>Enrolled</th>
                  <th className={thClass}>Emergency<br />Contact</th>
                  <th className={thClass}>Parent<br />Auth</th>
                  <th className={thClass}>Immunization<br />(DH 680)</th>
                  <th className={thClass}>Health Exam<br />(DH 3040)</th>
                  <th className={thClass}>Birth<br />Certificate</th>
                  <th className={thClass}>Proof of<br />Residency</th>
                  <th className={thClass}>Custody /<br />Court Orders</th>
                  <th className={thClass}>Status</th>
                  <th className="bg-navy" style={{ width: 36 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const overall = getOverall(r);
                  const even = i % 2 === 1;
                  return (
                    <tr key={r.id} className={`${even ? "bg-[rgba(240,237,230,0.3)]" : ""} hover:bg-[rgba(27,77,107,0.02)]`}>
                      <td className={`${tdClass} text-left`}>
                        <input
                          value={r.name}
                          onChange={(e) => updateCell(i, "name", e.target.value)}
                          placeholder="Full name"
                          className={`${inputClass} min-w-[150px] font-medium`}
                        />
                      </td>
                      <td className={tdClass}>
                        <input
                          type="date"
                          value={r.enrolled}
                          onChange={(e) => updateCell(i, "enrolled", e.target.value)}
                          className={`${inputClass} min-w-[120px]`}
                        />
                      </td>
                      {DOCS.map((doc) => (
                        <td key={doc} className={tdClass}>
                          <StatusBadge value={r[doc]} onClick={() => cycleStatus(i, doc)} />
                        </td>
                      ))}
                      <td className={tdClass}>
                        {overall === "complete" && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F5E9] text-[#2E7D32]">COMPLETE</span>
                        )}
                        {overall === "incomplete" && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEE2E2] text-[#B91C1C]">INCOMPLETE</span>
                        )}
                        {overall === "" && (
                          <span className="text-[#CBD5E1] text-[11px]">—</span>
                        )}
                      </td>
                      <td className={`${tdClass} border-r-0`} style={{ width: 36 }}>
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
              Add Child
            </button>
          </div>
        </div>

        {/* Callout */}
        <div className="rounded-[12px] px-6 py-5 bg-[#F0EDE6] border border-[rgba(196,152,90,0.3)]" style={{ borderLeft: "4px solid #C4985A" }}>
          <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#C4985A] mb-2">Track this in Compleros</div>
          <p className="text-[14px] text-navy leading-relaxed">
            With a Basic plan, Compleros automatically alerts you when enrollment documents are missing or expired — across every child in your program. No more manual file checks.
          </p>
        </div>
      </div>

      {/* Reset modal */}
      {showReset && (
        <div className="fixed inset-0 bg-[rgba(19,58,82,0.5)] backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowReset(false)}>
          <div className="bg-white rounded-[14px] p-7 max-w-[420px] w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-[22px] text-navy mb-2.5">Start over?</h3>
            <p className="text-[14px] text-muted leading-relaxed mb-6">This clears all enrollment data on this device. This cannot be undone.</p>
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

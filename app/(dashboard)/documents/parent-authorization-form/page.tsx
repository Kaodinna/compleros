"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/dashboard/Header";
import Link from "next/link";

const STORAGE_KEY = "compleros-template-parent-authorization-form";
const DOC_ID = "CMP-TMP-PAF-001";

type Fields = Record<string, string>;

const AUTH_SECTIONS = [
  { id: "photo",     num: 2, title: "Photo & Video Release", auths: [
    { id: "authPhoto",     label: "Photograph and Video Consent",       hasConditions: true,
      desc: "I grant permission for this program to photograph and/or video record my child during program activities. Images may be used for internal documentation, classroom displays, social media, marketing materials, and the program website. My child will not be identified by full name without separate written consent." },
  ]},
  { id: "fieldtrip", num: 3, title: "Field Trip Authorization", auths: [
    { id: "authFieldTrip", label: "Off-Site Field Trips and Excursions", hasConditions: false,
      desc: "I grant permission for my child to participate in supervised off-site field trips and excursions organized by the program. I understand that I will be notified in advance of each trip, including destination, date, and transportation method." },
  ]},
  { id: "sunscreen", num: 4, title: "Sunscreen & Insect Repellent", auths: [
    { id: "authSunscreen", label: "Application of Sunscreen",           hasConditions: false,
      desc: "I grant permission for program staff to apply sunscreen (SPF 30 or higher) to my child before outdoor activities. I will provide sunscreen for my child, or authorize the program to use its supply." },
    { id: "authInsect",    label: "Application of Insect Repellent",    hasConditions: false,
      desc: "I grant permission for program staff to apply insect repellent to my child when outdoor conditions warrant it. I will provide insect repellent for my child, or authorize the program to use its supply." },
  ]},
  { id: "transport", num: 5, title: "Transportation Authorization", auths: [
    { id: "authTransport", label: "Program-Provided Transportation",    hasConditions: false,
      desc: "I grant permission for my child to be transported in program-operated or program-contracted vehicles for field trips, between program sites, or for other program-related purposes. All drivers meet DCF background screening requirements and vehicles are properly insured." },
  ]},
  { id: "water",     num: 6, title: "Water Activities", auths: [
    { id: "authWater",     label: "Supervised Water Activities",        hasConditions: false,
      desc: "I grant permission for my child to participate in supervised water activities, including sprinkler play, water tables, and splash pads. Swimming pools require separate written authorization per DCF Rule 65C-22.008." },
  ]},
  { id: "walking",   num: 7, title: "Walking Trips", auths: [
    { id: "authWalking",   label: "Neighborhood Walking Trips",         hasConditions: false,
      desc: "I grant permission for my child to participate in supervised walking trips in the immediate neighborhood of the program facility (e.g., walks to a nearby park, library, or nature area). Staff-to-child ratios will be maintained." },
  ]},
];

const ALL_AUTH_IDS = ["authPhoto", "authFieldTrip", "authSunscreen", "authInsect", "authTransport", "authWater", "authWalking"];

function buildPrintDocument(fields: Fields, today: string): string {
  const esc = (s: string | undefined | null) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));

  const fmtDate = (d: string) => {
    if (!d) return "";
    const p = d.split("-");
    if (p.length < 3) return d;
    return `${p[1]}/${p[2]}/${p[0]}`;
  };

  const v = (id: string) => fields[id] ? esc(fields[id]) : "";

  const authBadge = (id: string) => {
    const val = fields[id];
    if (val === "yes") return `<span style="display:inline-block;padding:2px 9px;border-radius:100px;font-size:9px;font-weight:700;background:#E8F5E9;color:#2E7D32">AUTHORIZED</span>`;
    if (val === "no")  return `<span style="display:inline-block;padding:2px 9px;border-radius:100px;font-size:9px;font-weight:700;background:#FEE2E2;color:#B91C1C">NOT AUTHORIZED</span>`;
    return `<span style="display:inline-block;padding:2px 9px;border-radius:100px;font-size:9px;font-weight:700;background:#F0EDE6;color:#94A3B8">PENDING</span>`;
  };

  let authHtml = "";
  for (const sec of AUTH_SECTIONS) {
    authHtml += `<div style="margin-bottom:10px;page-break-inside:avoid">
      <div style="font-size:10px;font-weight:700;color:#1B4D6B;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:4px;border-bottom:1.5px solid #C4985A;margin-bottom:8px">${sec.num}. ${esc(sec.title)}</div>`;
    for (const a of sec.auths) {
      authHtml += `<div style="margin-bottom:6px">
        <div style="font-size:10px;font-weight:700;color:#1B4D6B;margin-bottom:3px">${esc(a.label)}</div>
        ${authBadge(a.id)}
        ${a.hasConditions && fields["authPhoto_cond"] ? `<div style="font-size:8.5px;color:#475569;margin-top:3px;font-style:italic">Conditions: ${esc(fields["authPhoto_cond"])}</div>` : ""}
      </div>`;
    }
    authHtml += `</div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Parent Authorization Form · Compleros</title>
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { font-family:Arial,Helvetica,sans-serif;color:#2D3748;font-size:9.5px;line-height:1.4; }
    @page { size:letter;margin:12mm 14mm; }
    @media print { * { -webkit-print-color-adjust:exact !important;print-color-adjust:exact !important; } }
    table { width:100%;border-collapse:collapse; }
    td { vertical-align:top; }
    .info-table td { padding:4px 8px;border-bottom:1px solid #F0EDE6; }
    .lbl { width:18%;font-size:8.5px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap; }
    .val { width:32%;font-size:9.5px;color:#2D3748;font-weight:500; }
  </style>
</head>
<body>
  <table style="border:none;border-bottom:2px solid #C4985A;margin-bottom:12px">
    <tr>
      <td style="border:none;font-size:20px;font-weight:700;color:#1B4D6B;padding:0">Compleros</td>
      <td style="border:none;text-align:right;padding:0">
        <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#C4985A;margin-bottom:2px">Family &amp; Enrollment Template</div>
        <div style="font-size:14px;font-weight:700;color:#1B4D6B">Parent Authorization Form</div>
      </td>
    </tr>
  </table>

  <div style="font-size:10px;font-weight:700;color:#1B4D6B;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:4px;border-bottom:1.5px solid #C4985A;margin-bottom:8px">1. Child &amp; Parent Information</div>
  <table class="info-table" style="margin-bottom:14px">
    <tr>
      <td class="lbl">Child&apos;s Full Name</td><td class="val" colspan="3">${v("childName") || "&nbsp;"}</td>
      <td class="lbl">Date of Birth</td><td class="val">${fmtDate(fields["dob"] || "") || "&nbsp;"}</td>
      <td class="lbl">Classroom</td><td class="val">${v("classroom") || "&nbsp;"}</td>
    </tr>
    <tr>
      <td class="lbl">Parent/Guardian 1</td><td class="val">${v("p1Name") || "&nbsp;"}</td>
      <td class="lbl">Phone</td><td class="val">${v("p1Phone") || "&nbsp;"}</td>
      <td class="lbl">Email</td><td class="val" colspan="3">${v("p1Email") || "&nbsp;"}</td>
    </tr>
    <tr>
      <td class="lbl">Parent/Guardian 2</td><td class="val">${v("p2Name") || "&nbsp;"}</td>
      <td class="lbl">Phone</td><td class="val">${v("p2Phone") || "&nbsp;"}</td>
      <td class="lbl">Email</td><td class="val" colspan="3">${v("p2Email") || "&nbsp;"}</td>
    </tr>
    <tr>
      <td class="lbl">Program Year</td><td class="val" colspan="3">${v("enrollPeriod") || "&nbsp;"}</td>
      <td class="lbl">Date</td><td class="val" colspan="3">${fmtDate(fields["formDate"] || "") || "&nbsp;"}</td>
    </tr>
  </table>

  ${authHtml}

  ${fields["addlConditions"] ? `
  <div style="margin-bottom:10px;page-break-inside:avoid">
    <div style="font-size:10px;font-weight:700;color:#1B4D6B;text-transform:uppercase;letter-spacing:0.8px;padding-bottom:4px;border-bottom:1.5px solid #C4985A;margin-bottom:8px">8. Additional Conditions or Restrictions</div>
    <div style="font-size:9.5px;padding:5px 8px;background:#F7F5F0;border-radius:4px;min-height:30px">${esc(fields["addlConditions"]).replace(/\n/g, "<br>")}</div>
  </div>` : ""}

  <div style="margin-top:14px;padding:8px 12px;background:#F0EDE6;border:1px solid rgba(196,152,90,0.3);border-left:3px solid #C4985A;border-radius:4px">
    <div style="font-size:8px;font-weight:700;color:#C4985A;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Track this in Compleros</div>
    <div style="font-size:8.5px;color:#133A52">Track whether each child&apos;s authorization form is on file and current. Compleros tracks status, never records.</div>
  </div>

  <table style="border:none;border-top:2px solid #C4985A;margin-top:12px">
    <tr>
      <td style="border:none;font-size:8px;color:#94A3B8;text-align:left;padding:5px 0 0">${esc(DOC_ID)} · Generated ${today}</td>
      <td style="border:none;font-size:8px;color:#94A3B8;text-align:right;padding:5px 0 0">Compleros · Compliance Management for Florida Education Providers</td>
    </tr>
  </table>
  <script>window.onload = function () { setTimeout(function () { window.print(); }, 300); }</script>
</body>
</html>`;
}

const inputBase = "w-full bg-cream border border-[#E5E1D8] rounded-[8px] px-3 py-[9px] text-[14px] font-[inherit] text-[#2D3748] transition-all focus:outline-none focus:bg-white focus:border-[#2A6A8F] focus:shadow-[0_0_0_3px_rgba(27,77,107,0.08)]";

function AuthRadio({ authId, value, onChange }: { authId: string; value: string; onChange: (id: string, v: string) => void }) {
  return (
    <div className="flex gap-4">
      <label className={`flex flex-1 items-center justify-center gap-2.5 px-4 py-[10px] border-2 rounded-[10px] cursor-pointer transition-all select-none ${value === "yes" ? "border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32]" : "border-[#E5E1D8] text-muted hover:border-[#2A6A8F] hover:bg-cream"}`}>
        <input type="radio" name={authId} value="yes" checked={value === "yes"} onChange={() => onChange(authId, "yes")} className="sr-only" />
        <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${value === "yes" ? "border-[#2E7D32] bg-[#2E7D32]" : "border-[#CBD5E1]"}`}>
          {value === "yes" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        <span className="text-[14px] font-semibold">I Authorize</span>
      </label>
      <label className={`flex flex-1 items-center justify-center gap-2.5 px-4 py-[10px] border-2 rounded-[10px] cursor-pointer transition-all select-none ${value === "no" ? "border-[#B91C1C] bg-[#FEE2E2] text-[#B91C1C]" : "border-[#E5E1D8] text-muted hover:border-[#2A6A8F] hover:bg-cream"}`}>
        <input type="radio" name={authId} value="no" checked={value === "no"} onChange={() => onChange(authId, "no")} className="sr-only" />
        <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${value === "no" ? "border-[#B91C1C] bg-[#B91C1C]" : "border-[#CBD5E1]"}`}>
          {value === "no" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        <span className="text-[14px] font-semibold">I Do Not Authorize</span>
      </label>
    </div>
  );
}

export default function ParentAuthorizationFormPage() {
  const [fields, setFields] = useState<Fields>({});
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [showReset, setShowReset] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (typeof data === "object" && data !== null) setFields(data);
      }
    } catch {}
  }, []);

  const persist = useCallback((next: Fields) => {
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      setSaveStatus("saved");
    }, 300);
  }, []);

  const updateField = useCallback((id: string, value: string) => {
    setFields((prev) => {
      const next = { ...prev, [id]: value };
      persist(next);
      return next;
    });
  }, [persist]);

  const resetAll = () => {
    setFields({});
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setShowReset(false);
  };

  const downloadPDF = () => {
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const html = buildPrintDocument(fields, today);
    const win = window.open("", "_blank");
    if (!win) { alert("Allow pop-ups for this site to save as PDF."); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  let authorized = 0, declined = 0, pending = 0;
  ALL_AUTH_IDS.forEach((id) => {
    const v = fields[id];
    if (v === "yes") authorized++;
    else if (v === "no") declined++;
    else pending++;
  });

  const sectionCard = "bg-white border border-[#E5E1D8] rounded-[14px] px-6 sm:px-7 py-6 mb-[18px] shadow-sm";
  const labelClass = "block text-[11.5px] font-semibold text-navy mb-1.5";

  return (
    <>
      <Header title="Parent Authorization Form" />

      {/* Action bar */}
      <div className="bg-white border-b border-[#E2DFD8] px-4 sm:px-8 py-3 flex flex-wrap items-center gap-3 sticky top-[60px] z-20 shadow-sm">
        <Link href="/documents" className="flex items-center gap-1.5 text-[13px] text-muted hover:text-navy transition-colors shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Templates
        </Link>
        <span className="text-muted/40 text-[13px]">/</span>
        <span className="text-[13px] text-navy font-medium hidden sm:block">Parent Authorization Form</span>

        {/* Auth summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {authorized > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[12px] font-semibold bg-[#E8F5E9] border border-[rgba(46,125,50,0.18)] text-[#2E7D32]">
              <span className="font-bold">{authorized}</span> authorized
            </span>
          )}
          {declined > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[12px] font-semibold bg-[#FEE2E2] border border-[rgba(185,28,28,0.18)] text-[#B91C1C]">
              <span className="font-bold">{declined}</span> declined
            </span>
          )}
          {pending > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[12px] font-semibold bg-[#E8E4DA] border border-[#E2DFD8] text-muted">
              <span className="font-bold">{pending}</span> pending
            </span>
          )}
        </div>

        <div className="flex-1" />

        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border ${saveStatus === "saving" ? "bg-[#FEF3C7] border-[rgba(180,83,9,0.2)] text-[#B45309]" : "bg-[#E8F5E9] border-[rgba(46,125,50,0.18)] text-[#2E7D32]"}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {saveStatus === "saving" ? "Saving…" : "All changes saved"}
        </div>

        <button onClick={() => setShowReset(true)} className="flex items-center gap-1.5 px-3 py-[9px] rounded-[8px] text-[13px] font-semibold text-muted hover:text-red-600 hover:bg-red-50 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Start Over
        </button>
        <a href="/Compleros_Parent_Authorization_Form.pdf" download className="flex items-center gap-1.5 px-3 py-[9px] border border-[#E2DFD8] rounded-[8px] text-[13px] font-semibold text-navy hover:border-navy hover:bg-[#E8EEF2] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Blank PDF
        </a>
        <button onClick={downloadPDF} className="flex items-center gap-1.5 px-3 py-[9px] bg-[#C4985A] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#B88A4E] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download PDF
        </button>
      </div>

      {/* Page body */}
      <div className="p-4 sm:p-8 pb-20 max-w-[900px] w-full">

        {/* Hero */}
        <div className="mb-8 pb-7 border-b border-[#EEEAE1]">
          <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#C4985A] mb-3.5">Family &amp; Enrollment Template</div>
          <h1 className="font-heading text-[34px] text-navy leading-[1.1] mb-3">Parent Authorization Form</h1>
          <p className="text-[15px] text-muted leading-[1.6] max-w-[740px]">
            One form per child, one signature covers everything. Review each authorization category, select your choice, and download the completed PDF to print, sign, and keep on file at your facility.
          </p>
          <div className="inline-flex items-center gap-2 mt-[18px] px-3.5 py-[9px] bg-[#E8E4DA] rounded-[8px] text-[12.5px] font-medium text-[#475569]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy shrink-0"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span><strong className="text-navy">Your work stays on this device.</strong> Compleros never sees or stores what you type here.</span>
          </div>
        </div>

        {/* Section 1: Child & Parent Information */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#EEEAE1] mb-[18px]">
            <span className="font-heading text-[13px] text-[#C4985A] bg-[#EFE4D0] rounded-[6px] px-2.5 py-1 shrink-0">1</span>
            <h2 className="font-heading text-[20px] text-navy leading-tight">Child &amp; Parent Information</h2>
          </div>
          <div className="grid grid-cols-12 gap-x-4 gap-y-3.5">
            <div className="col-span-12 sm:col-span-6"><label className={labelClass}>Child&apos;s Full Name <span className="text-red-600">*</span></label><input type="text" value={fields["childName"] ?? ""} onChange={(e) => updateField("childName", e.target.value)} className={inputBase} /></div>
            <div className="col-span-12 sm:col-span-3"><label className={labelClass}>Date of Birth <span className="text-red-600">*</span></label><input type="date" value={fields["dob"] ?? ""} onChange={(e) => updateField("dob", e.target.value)} className={inputBase} /></div>
            <div className="col-span-12 sm:col-span-3"><label className={labelClass}>Classroom</label><input type="text" value={fields["classroom"] ?? ""} onChange={(e) => updateField("classroom", e.target.value)} className={inputBase} /></div>
            <div className="col-span-12 sm:col-span-6"><label className={labelClass}>Parent/Guardian 1 Name <span className="text-red-600">*</span></label><input type="text" value={fields["p1Name"] ?? ""} onChange={(e) => updateField("p1Name", e.target.value)} className={inputBase} /></div>
            <div className="col-span-12 sm:col-span-3"><label className={labelClass}>Phone <span className="text-red-600">*</span></label><input type="tel" value={fields["p1Phone"] ?? ""} onChange={(e) => updateField("p1Phone", e.target.value)} className={inputBase} /></div>
            <div className="col-span-12 sm:col-span-3"><label className={labelClass}>Email</label><input type="email" value={fields["p1Email"] ?? ""} onChange={(e) => updateField("p1Email", e.target.value)} className={inputBase} /></div>
            <div className="col-span-12 sm:col-span-6"><label className={labelClass}>Parent/Guardian 2 Name</label><input type="text" value={fields["p2Name"] ?? ""} onChange={(e) => updateField("p2Name", e.target.value)} className={inputBase} /></div>
            <div className="col-span-12 sm:col-span-3"><label className={labelClass}>Phone</label><input type="tel" value={fields["p2Phone"] ?? ""} onChange={(e) => updateField("p2Phone", e.target.value)} className={inputBase} /></div>
            <div className="col-span-12 sm:col-span-3"><label className={labelClass}>Email</label><input type="email" value={fields["p2Email"] ?? ""} onChange={(e) => updateField("p2Email", e.target.value)} className={inputBase} /></div>
            <div className="col-span-12 sm:col-span-6"><label className={labelClass}>Program Year / Enrollment Period</label><input type="text" value={fields["enrollPeriod"] ?? ""} onChange={(e) => updateField("enrollPeriod", e.target.value)} placeholder="e.g., 2025–2026" className={inputBase} /></div>
            <div className="col-span-12 sm:col-span-6"><label className={labelClass}>Date</label><input type="date" value={fields["formDate"] ?? ""} onChange={(e) => updateField("formDate", e.target.value)} className={inputBase} /></div>
          </div>
        </div>

        {/* Authorization sections 2–7 */}
        {AUTH_SECTIONS.map((section) => (
          <div key={section.id} className={sectionCard}>
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#EEEAE1] mb-[18px]">
              <span className="font-heading text-[13px] text-[#C4985A] bg-[#EFE4D0] rounded-[6px] px-2.5 py-1 shrink-0">{section.num}</span>
              <h2 className="font-heading text-[20px] text-navy leading-tight">{section.title}</h2>
            </div>
            <div className="space-y-5">
              {section.auths.map((auth, ii) => (
                <div key={auth.id} className={ii > 0 ? "pt-5 border-t border-dashed border-[#E5E1D8]" : ""}>
                  <h3 className="font-heading text-[17px] text-navy mb-2">{auth.label}</h3>
                  <p className="text-[13.5px] text-muted leading-[1.6] mb-3.5">{auth.desc}</p>
                  <AuthRadio authId={auth.id} value={fields[auth.id] ?? ""} onChange={updateField} />
                  {auth.hasConditions && (
                    <div className="mt-3.5">
                      <label className="block text-[11px] text-muted font-medium mb-1">Conditions or restrictions (optional)</label>
                      <input
                        type="text"
                        value={fields["authPhoto_cond"] ?? ""}
                        onChange={(e) => updateField("authPhoto_cond", e.target.value)}
                        placeholder="e.g., No social media use, internal only"
                        className={inputBase}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Section 8: Additional Conditions */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#EEEAE1] mb-[18px]">
            <span className="font-heading text-[13px] text-[#C4985A] bg-[#EFE4D0] rounded-[6px] px-2.5 py-1 shrink-0">8</span>
            <h2 className="font-heading text-[20px] text-navy leading-tight">Additional Conditions or Restrictions</h2>
          </div>
          <p className="text-[12.5px] text-muted italic mb-4">List any conditions, restrictions, or information the program should know about regarding these authorizations.</p>
          <textarea
            value={fields["addlConditions"] ?? ""}
            onChange={(e) => updateField("addlConditions", e.target.value)}
            rows={4}
            className={`${inputBase} resize-y`}
          />
        </div>

        {/* Callout */}
        <div className="rounded-[12px] px-6 sm:px-7 py-6 mt-[10px]" style={{ background: "linear-gradient(120deg, #F0EDE6, #F7F5F0)", border: "1px solid rgba(196,152,90,0.3)", borderLeft: "4px solid #C4985A" }}>
          <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#C4985A] mb-2">Track this in Compleros</div>
          <p className="text-[14.5px] text-navy leading-[1.6]">
            Track whether each child&apos;s authorization form is on file and current. Compleros tracks status, never records.
          </p>
        </div>
      </div>

      {/* Reset modal */}
      {showReset && (
        <div className="fixed inset-0 bg-[rgba(19,58,82,0.5)] backdrop-blur-[4px] z-50 flex items-center justify-center p-6" onClick={() => setShowReset(false)}>
          <div className="bg-white rounded-[14px] p-7 max-w-[420px] w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-[22px] text-navy mb-2.5">Start over?</h3>
            <p className="text-[14px] text-muted leading-[1.55] mb-6">This clears all form data on this device. This cannot be undone.</p>
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

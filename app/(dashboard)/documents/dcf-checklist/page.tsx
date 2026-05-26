"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/dashboard/Header";
import Link from "next/link";

interface ProgramField { id: string; label: string; type: string; full?: boolean; }
interface ChecklistItem { id: string; label: string; note?: string; }
interface ChecklistSection { id: string; number: number; title: string; intro: string; items: ChecklistItem[]; }

const TEMPLATE_TITLE = "DCF Facility License Application Checklist";
const TEMPLATE_INTRO =
  "Work through each section before submitting your application to the Florida Department of Children and Families (DCF). Every item maps to a requirement under Chapter 402, F.S., Rule 65C-22, F.A.C., and the CF-FSP 5017 application form. Check items off as you assemble your application package — a complete submission moves faster through DCF review.";
const STORAGE_KEY = "compleros-template-dcf-license-checklist";
const DOC_ID = "CMP-TMP-DCF-001";

const PROGRAM_FIELDS: ProgramField[] = [
  { id: "programName", label: "Program Name (as it will appear on license)", type: "text", full: true },
  { id: "applicationType", label: "Application Type (Initial / Renewal / Change of Ownership)", type: "text" },
  { id: "licenseNumber", label: "License Number (renewals only)", type: "text" },
  { id: "physicalAddress", label: "Physical Address of Facility", type: "text", full: true },
  { id: "county", label: "County", type: "text" },
  { id: "maxCapacity", label: "Maximum Capacity", type: "text" },
  { id: "ownershipType", label: "Ownership Type (Individual / Corporation / LLC / Partnership / Other Entity)", type: "text" },
  { id: "directorName", label: "Director / Owner Name", type: "text" },
  { id: "targetDate", label: "Target Submission Date", type: "date" },
];

const SECTIONS: ChecklistSection[] = [
  {
    id: "s1", number: 1, title: "Application Forms, Fees & Program Details",
    intro: "Core application documents required for CF-FSP 5017. Maps to Parts 1 and 2 of the DCF form.",
    items: [
      { id: "1-1", label: "CF-FSP Form 5017 — completed in blue or black ink, no white-out", note: "Download from myflfamilies.com — signed and dated by owner, director, or designated representative" },
      { id: "1-2", label: "Annual license fee payment", note: "Check or money order payable to the Department of Children and Families" },
      { id: "1-3", label: "Federal Employer Identification Number (EIN) documentation" },
      { id: "1-4", label: "Maximum capacity determined and entered on application", note: "Based on indoor square footage per F.A.C. 65C-22.002(1) — 35 sq. ft. per child" },
      { id: "1-5", label: "Program designations selected (Faith Based, Head Start, VPK, School Readiness, etc.)", note: "Part 1 of CF-FSP 5017 — check all that apply to your program" },
      { id: "1-6", label: "Service options declared (Full Day, Before/After School, Infant Care, Transportation, etc.)", note: "Part 1 of CF-FSP 5017 — check all service types you will offer" },
      { id: "1-7", label: "Days, hours, and months of operation documented" },
      { id: "1-8", label: "For renewals: application submitted at least 45 days before license expiration", note: "Failure to submit 45 days prior is a licensing violation under Rule 65C-22.010(2)(c), F.A.C." },
    ],
  },
  {
    id: "s2", number: 2, title: "Ownership Documentation",
    intro: "Required documents depend on your ownership type. Complete the section that applies per Part 2 of CF-FSP 5017.",
    items: [
      { id: "2-1", label: "Individual Ownership — owner name, DOB, SSN, home address on form (Sections A + F)", note: "One owner only. Complete Section A on CF-FSP 5017." },
      { id: "2-2", label: "Corporation — Articles of Incorporation with Board of Directors names and registered agent", note: "Initial: Articles of Incorporation. Renewal: current Certificate of Status from SunBiz.org. Complete Sections B + F." },
      { id: "2-3", label: "LLC — Articles of Organization with member names and registered agent", note: "Initial: Articles of Organization. Renewal: current Certificate of Status from SunBiz.org. Complete Sections C + F." },
      { id: "2-4", label: "Partnership — copy of Partnership Agreement (submit annually)", note: "Attach additional sheets if more than two partners. Complete Sections D + F." },
      { id: "2-5", label: "Other Entity — entity name, designated representative, and entity address", note: "School Boards, municipalities, before/after school programs, faith-based orgs. Complete Sections E + F." },
      { id: "2-6", label: "On-site Director information completed (Section F — required for all applicants)", note: "Director name, DOB, SSN, home address, credential, and cell phone number" },
      { id: "2-7", label: "If facility is in or adjacent to the owner/operator home: household member list with names and DOBs attached", note: "All household members must complete Level 2 background screening" },
    ],
  },
  {
    id: "s3", number: 3, title: "Facility & Premises",
    intro: "Documentation proving the physical location meets all state and local requirements.",
    items: [
      { id: "3-1", label: "Proof of ownership or current lease agreement", note: "Lease must cover the full license period" },
      { id: "3-2", label: "Floor plan of the facility", note: "Include square footage per room, indoor play space, and outdoor play area" },
      { id: "3-3", label: "Local zoning approval or compliance letter", note: "Obtain approval from local zoning and building code offices prior to submission" },
      { id: "3-4", label: "Current local fire inspection report", note: "Must be dated within the last 12 months and show satisfactory status" },
      { id: "3-5", label: "Current environmental / sanitation inspection report", note: "Issued by the county health department" },
      { id: "3-6", label: "Playground safety inspection (if applicable)" },
      { id: "3-7", label: "Water quality testing results (if on well water)" },
    ],
  },
  {
    id: "s4", number: 4, title: "Staff & Personnel",
    intro: "Credentials, screenings, and training documentation for every staff member.",
    items: [
      { id: "4-1", label: "Director credential documentation", note: "Florida Director Credential or National Administrator Credential (NAC)" },
      { id: "4-2", label: "Level 2 background screening results — all staff", note: "Fingerprinting through the Clearinghouse; renewed every 5 years per s. 402.305(2), F.S." },
      { id: "4-3", label: "Level 2 background screening — volunteers and household members (if applicable)" },
      { id: "4-4", label: "Proof of 45-hour DCF Introductory Child Care Training", note: "Or signed enrollment agreement within required timeframe" },
      { id: "4-5", label: "Staff emergency contact and health information forms" },
      { id: "4-6", label: "Staffing plan showing compliance with age-group ratios", note: "Refer to F.A.C. 65C-22.001(4) for required staff-to-child ratios" },
      { id: "4-7", label: "10-hour in-service training plan" },
      { id: "4-8", label: "Child enrichment service provider screening (if applicable)", note: "Per s. 402.3054, F.S. — Level 2 screening using Chapter 435 standards. Written parental consent required before child participates." },
    ],
  },
  {
    id: "s5", number: 5, title: "Health & Safety",
    intro: "Operating procedures that protect children while in your care.",
    items: [
      { id: "5-1", label: "Written emergency preparedness plan (fire, weather, lockdown)" },
      { id: "5-2", label: "Posted evacuation routes and emergency contact information" },
      { id: "5-3", label: "First aid supplies and posted CPR/first aid certifications" },
      { id: "5-4", label: "Written medication administration policy" },
      { id: "5-5", label: "Written discipline policy (must prohibit corporal punishment)" },
      { id: "5-6", label: "Written policy on the release of children (authorized pickup)" },
      { id: "5-7", label: "Documented daily health check procedures" },
      { id: "5-8", label: "Transportation safety plan (if transporting children)", note: "Includes vehicle inspection records and driver license/background verification" },
    ],
  },
  {
    id: "s6", number: 6, title: "Enrollment & Records",
    intro: "Record-keeping systems and forms used for enrolled children.",
    items: [
      { id: "6-1", label: "Enrollment form template" },
      { id: "6-2", label: "Immunization record (DH Form 680) collection procedure", note: "Required before first day of attendance per F.S. 1003.22" },
      { id: "6-3", label: "Student health exam record (DH Form 3040) collection procedure" },
      { id: "6-4", label: "Emergency contact and authorized pickup form per child" },
      { id: "6-5", label: "Parental consent forms (photo, field trips, sunscreen, transportation)" },
      { id: "6-6", label: "Daily attendance tracking system" },
      { id: "6-7", label: "Incident/accident reporting form and log" },
    ],
  },
  {
    id: "s7", number: 7, title: "Insurance & Financial",
    intro: "Financial and liability documentation required for operation.",
    items: [
      { id: "7-1", label: "Certificate of general liability insurance" },
      { id: "7-2", label: "Proof of vehicle insurance (if transporting children)" },
      { id: "7-3", label: "Workers' compensation coverage (if required by employee count)" },
      { id: "7-4", label: "Parent fee schedule and written enrollment agreement template" },
    ],
  },
  {
    id: "s8", number: 8, title: "Attestations & Compliance Declarations",
    intro: "Signed declarations required in Part 3 of CF-FSP 5017. These are legal attestations — review each before signing.",
    items: [
      { id: "8-1", label: "Mandated reporter affidavit — all child care personnel comply with s. 39.201, F.S.", note: "Signed affidavit confirming all staff meet mandatory reporting requirements" },
      { id: "8-2", label: "Background screening attestation — compliance with Chapter 435, F.S.", note: "Signed under penalty of perjury confirming all personnel have completed required screenings" },
      { id: "8-3", label: "Rilya Wilson Act acknowledgment — receipt confirmed per s. 39.604, F.S.", note: "Acknowledges reporting requirements and educational stability provisions" },
      { id: "8-4", label: "HIPAA compliance acknowledgment — signature confirms commitment to protect health record confidentiality", note: "Covers employee and children's health records in your possession" },
      { id: "8-5", label: "Disclosure: owner/applicant/director has never had a license denied, revoked, or suspended", note: "If yes, explanation must be attached. Truthfulness attested under penalty of perjury." },
      { id: "8-6", label: "Disclosure: prior licenses held with any state agency (other than driver's license)", note: "If yes, provide state, license type, number, and name used" },
      { id: "8-7", label: "Outstanding fines from prior licensing actions paid in full", note: "License issuance or renewal is contingent on payment of any uncontested or affirmed fines" },
    ],
  },
  {
    id: "s9", number: 9, title: "Final Review Before Submission",
    intro: "Last-mile quality check before handing off to DCF.",
    items: [
      { id: "9-1", label: "All forms completed in blue or black ink — no white-out used", note: "Strikethroughs must be initialed. White-out will result in the application being returned." },
      { id: "9-2", label: "All attestation pages signed and dated by applicant" },
      { id: "9-3", label: "Ownership-specific sections completed (only the section that applies)" },
      { id: "9-4", label: "Section F (On-site Director) completed regardless of ownership type" },
      { id: "9-5", label: "All supporting documents attached and organized" },
      { id: "9-6", label: "Copies made of the complete application package for internal records" },
      { id: "9-7", label: "Submission method confirmed (mail, in-person, or DCF online portal)" },
      { id: "9-8", label: "Licensing counselor contact information on file for follow-up", note: "DCF has 30 days to notify you of errors/omissions and 90 days to approve or deny once the application is complete." },
    ],
  },
];

function buildPrintDocument(
  programInfo: Record<string, string>,
  checked: Record<string, boolean>,
  notes: Record<string, string>,
  today: string
): string {
  const esc = (s: string | undefined | null) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));

  const programRows = PROGRAM_FIELDS.map((f) => `
    <tr>
      <td style="background:#F0EDE6;padding:7px 10px;font-size:10.5px;font-weight:700;color:#1B4D6B;border:1px solid #D5D5D5;width:200px;vertical-align:top">${esc(f.label)}</td>
      <td style="padding:7px 10px;font-size:11px;color:#2D3748;border:1px solid #D5D5D5">${esc(programInfo[f.id] ?? "")}</td>
    </tr>`).join("");

  const sectionsHTML = SECTIONS.map((s) => {
    const itemsHTML = s.items.map((item) => `
      <tr>
        <td style="width:20px;padding:4px 6px 4px 0;vertical-align:top;font-family:monospace;font-size:12px;color:#1B4D6B;font-weight:700">${checked[item.id] ? "☒" : "☐"}</td>
        <td style="padding:4px 0;vertical-align:top">
          <div style="font-size:11px;color:${checked[item.id] ? "#94A3B8" : "#2D3748"};${checked[item.id] ? "text-decoration:line-through;" : ""}">${esc(item.label)}</div>
          ${item.note ? `<div style="font-size:10px;color:#94A3B8;font-style:italic;margin-top:2px">${esc(item.note)}</div>` : ""}
        </td>
      </tr>`).join("");
    const n = notes[s.id];
    const notesHTML = n?.trim()
      ? `<tr><td colspan="2" style="padding-top:8px"><div style="background:#F0EDE6;border-left:3px solid #C4985A;padding:7px 10px;font-size:10px;color:#2D3748"><strong style="color:#1B4D6B;font-size:9px;text-transform:uppercase;letter-spacing:0.8px">Notes: </strong>${esc(n).replace(/\n/g, "<br>")}</div></td></tr>`
      : "";
    return `
      <div style="margin-bottom:20px;page-break-inside:avoid">
        <div style="border-bottom:2px solid #C4985A;padding-bottom:5px;margin-bottom:8px">
          <span style="font-size:10px;font-weight:700;color:#C4985A;text-transform:uppercase;letter-spacing:1.5px;margin-right:8px">Section ${s.number}</span>
          <span style="font-size:13px;font-weight:700;color:#1B4D6B">${esc(s.title)}</span>
        </div>
        <div style="font-size:11px;color:#64748B;font-style:italic;margin-bottom:8px">${esc(s.intro)}</div>
        <table style="width:100%;border-collapse:collapse"><tbody>${itemsHTML}${notesHTML}</tbody></table>
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${esc(TEMPLATE_TITLE)} · Compleros</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #2D3748; font-size: 11px; line-height: 1.4; }
    @page { size: letter; margin: 12mm 14mm; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
  </style>
</head>
<body>
  <!-- HEADER -->
  <table style="width:100%;border-collapse:collapse;border-bottom:2px solid #C4985A;padding-bottom:10px;margin-bottom:16px">
    <tr>
      <td style="font-size:24px;font-weight:700;color:#1B4D6B;letter-spacing:-0.5px">Compleros</td>
      <td style="text-align:right">
        <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C4985A;margin-bottom:3px">Compliance Template</div>
        <div style="font-size:16px;font-weight:700;color:#1B4D6B">${esc(TEMPLATE_TITLE)}</div>
      </td>
    </tr>
  </table>

  <!-- INTRO -->
  <p style="font-size:11px;color:#475569;line-height:1.55;margin-bottom:16px">${esc(TEMPLATE_INTRO)}</p>

  <!-- PROGRAM INFO -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
    <thead>
      <tr><th colspan="2" style="background:#1B4D6B;color:white;padding:7px 10px;font-size:11px;text-align:left;letter-spacing:0.3px">Program Information</th></tr>
    </thead>
    <tbody>${programRows}</tbody>
  </table>

  <!-- SECTIONS -->
  ${sectionsHTML}

  <!-- FOOTER -->
  <table style="width:100%;border-collapse:collapse;border-top:2px solid #C4985A;margin-top:24px;padding-top:8px">
    <tr>
      <td style="font-size:9px;color:#94A3B8">${esc(DOC_ID)} &nbsp;·&nbsp; Generated ${today}</td>
      <td style="text-align:right;font-size:9px;color:#94A3B8">Compleros · Compliance Management for Florida Education Providers</td>
    </tr>
  </table>
  <script>window.onload = function () { setTimeout(function () { window.print(); }, 300); }</script>
</body>
</html>`;
}

export default function DCFChecklistPage() {
  const [programInfo, setProgramInfo] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [showReset, setShowReset] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setProgramInfo(data.programInfo ?? {});
        setChecked(data.checked ?? {});
        setNotes(data.notes ?? {});
      }
    } catch {}
  }, []);


  const persist = useCallback((pi: Record<string, string>, ch: Record<string, boolean>, n: Record<string, string>) => {
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ programInfo: pi, checked: ch, notes: n })); } catch {}
      setSaveStatus("saved");
    }, 300);
  }, []);

  const toggleItem = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    persist(programInfo, next, notes);
  };

  const updateField = (id: string, val: string) => {
    const next = { ...programInfo, [id]: val };
    setProgramInfo(next);
    persist(next, checked, notes);
  };

  const updateNote = (id: string, val: string) => {
    const next = { ...notes, [id]: val };
    setNotes(next);
    persist(programInfo, checked, next);
  };

  const resetAll = () => {
    setProgramInfo({}); setChecked({}); setNotes({});
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setShowReset(false);
  };

  const downloadPDF = () => {
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const html = buildPrintDocument(programInfo, checked, notes, today);
    const win = window.open("", "_blank");
    if (!win) { alert("Allow pop-ups for this site to save as PDF."); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const allItems = SECTIONS.flatMap((s) => s.items);
  const totalItems = allItems.length;
  const doneItems = allItems.filter((i) => checked[i.id]).length;
  const progressPct = totalItems ? (doneItems / totalItems) * 100 : 0;

  return (
    <>
      <Header title="DCF Facility License Application Checklist" />

      {/* Sticky action bar — sits just below the 60px Header */}
      <div className="bg-white border-b border-[#E2DFD8] px-4 sm:px-8 py-3 flex flex-wrap items-center gap-3 sm:gap-4 sticky top-[60px] z-20 shadow-sm">
        {/* Back breadcrumb */}
        <Link
          href="/documents"
          className="flex items-center gap-1.5 text-[13px] text-muted hover:text-navy transition-colors shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Templates
        </Link>
        <span className="text-muted/40 text-[13px] shrink-0">/</span>
        <span className="text-[13px] text-navy font-medium truncate max-w-[200px] sm:max-w-none">DCF Facility License Application Checklist</span>

        <div className="flex-1" />

        {/* Save status */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border ${saveStatus === "saving" ? "bg-[#FEF3C7] border-[rgba(180,83,9,0.2)] text-[#B45309]" : "bg-[#E8F5E9] border-[rgba(46,125,50,0.18)] text-[#2E7D52]"}`}>
          {saveStatus === "saving" ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/></svg>Saving…</>
          ) : (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Saved</>
          )}
        </div>

        {/* Progress */}
        <div className="hidden sm:block w-[200px] shrink-0">
          <div className="flex justify-between mb-1 text-[11px] font-semibold text-muted">
            <span>Progress</span>
            <span><span className="text-navy font-bold">{doneItems}</span> / {totalItems}</span>
          </div>
          <div className="h-1.5 bg-[#E8E4DA] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#C4985A] to-[#D4B07A] rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <button onClick={() => setShowReset(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12.5px] font-semibold text-muted hover:text-red-600 hover:bg-red-50 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Start Over
        </button>
        <a href="/Compleros_DCF_License_Application_Checklist.docx" download className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2DFD8] rounded-[7px] text-[12.5px] font-semibold text-navy hover:border-navy hover:bg-[#E8EEF2] transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Blank DOCX
        </a>
        <button onClick={downloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C4985A] text-white rounded-[7px] text-[12.5px] font-semibold hover:bg-[#B88A4E] transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download PDF
        </button>
      </div>

      {/* Page body */}
      <div className="p-4 sm:p-8 max-w-[900px] mx-auto pb-20 w-full">

        {/* Hero */}
        <div className="mb-8 pb-7 border-b border-[#EEEAE1]">
          <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#C4985A] mb-3">Licensing &amp; Application Template</div>
          <h1 className="font-heading text-[28px] sm:text-[36px] text-navy leading-tight tracking-[-0.5px] mb-3">{TEMPLATE_TITLE}</h1>
          <p className="text-[14.5px] text-muted leading-relaxed max-w-[720px]">{TEMPLATE_INTRO}</p>
          <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-2 bg-[#E8E4DA] rounded-[8px] text-[12.5px] font-medium text-[#475569]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span><strong className="text-navy">Your work stays on this device.</strong> Compleros never sees or stores what you type here.</span>
          </div>
        </div>

        {/* Program info */}
        <div className="bg-white border border-[#E2DFD8] rounded-[14px] p-6 sm:p-7 mb-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-[8px] bg-[#E8EEF2] text-navy flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h2 className="font-heading text-[20px] text-navy">Program Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROGRAM_FIELDS.map((f) => (
              <div key={f.id} className={f.full ? "sm:col-span-2" : ""}>
                <label className="block text-[12px] font-semibold text-navy mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={programInfo[f.id] ?? ""}
                  onChange={(e) => updateField(f.id, e.target.value)}
                  autoComplete="off"
                  className="w-full px-3.5 py-[10px] bg-[#F7F5F0] border border-[#E2DFD8] rounded-[8px] text-[13.5px] text-[#2D3748] focus:outline-none focus:bg-white focus:border-[#2A6A8F] transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => {
          const sectionDone = section.items.filter((i) => checked[i.id]).length;
          const complete = sectionDone === section.items.length;
          return (
            <section key={section.id} className="bg-white border border-[#E2DFD8] rounded-[14px] px-5 sm:px-8 py-6 mb-4 shadow-sm">
              <div className="pb-4 border-b border-[#EEEAE1] mb-4">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-heading text-[13px] text-[#C4985A] bg-[#EFE4D0] rounded-[6px] px-2.5 py-1 tracking-[1px]">
                    Section {section.number}
                  </span>
                  <span className={`ml-auto text-[12px] font-semibold flex items-center gap-1 ${complete ? "text-[#2E7D52]" : "text-muted"}`}>
                    {complete ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Complete
                      </>
                    ) : `${sectionDone} / ${section.items.length}`}
                  </span>
                </div>
                <h2 className="font-heading text-[20px] sm:text-[22px] text-navy leading-snug mb-1">{section.title}</h2>
                <p className="text-[13px] text-muted italic leading-relaxed">{section.intro}</p>
              </div>

              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 px-3 py-3 -mx-3 rounded-[8px] cursor-pointer hover:bg-[#F7F5F0] transition-colors select-none"
                    onClick={() => toggleItem(item.id)}
                    role="checkbox"
                    aria-checked={checked[item.id] ? "true" : "false"}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleItem(item.id); } }}
                  >
                    <div className={`w-[22px] h-[22px] rounded-[6px] border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${checked[item.id] ? "bg-[#C4985A] border-[#C4985A]" : "bg-white border-[#E2DFD8]"}`}>
                      {checked[item.id] && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[14px] font-medium leading-snug transition-colors ${checked[item.id] ? "text-muted line-through decoration-[#C4985A] decoration-[1.5px]" : "text-[#2D3748]"}`}>
                        {item.label}
                      </p>
                      {item.note && (
                        <p className={`text-[12px] italic mt-0.5 leading-snug ${checked[item.id] ? "text-[#94A3B8]" : "text-muted"}`}>{item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-dashed border-[#E2DFD8]">
                <label className="flex items-center gap-1.5 text-[11px] font-bold tracking-[1.2px] uppercase text-muted mb-2" htmlFor={`notes-${section.id}`}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Notes for this section
                </label>
                <textarea
                  id={`notes-${section.id}`}
                  value={notes[section.id] ?? ""}
                  onChange={(e) => updateNote(section.id, e.target.value)}
                  placeholder="Add your own notes — reminders, deadlines, or documents you're still waiting on…"
                  className="w-full bg-[#F7F5F0] border border-[#E2DFD8] rounded-[8px] px-3.5 py-2.5 text-[13px] text-[#2D3748] min-h-[56px] resize-y focus:outline-none focus:bg-white focus:border-[#2A6A8F] transition-all placeholder:text-[#94A3B8]"
                />
              </div>
            </section>
          );
        })}

        {/* Callout */}
        <div className="rounded-[12px] px-6 py-5 mt-6 bg-[#F0EDE6] border border-[rgba(196,152,90,0.3)]" style={{ borderLeft: "4px solid #C4985A" }}>
          <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#C4985A] mb-2">Track this in Compleros</div>
          <p className="text-[14px] text-navy leading-relaxed">
            Once your license is issued, add it to Compleros to monitor its renewal date, track staff credentials and background screenings against expiration, and stay ahead of every regulatory change affecting your program. Never wonder if you are compliant.
          </p>
        </div>
      </div>

      {/* Reset modal */}
      {showReset && (
        <div className="fixed inset-0 bg-[rgba(19,58,82,0.5)] backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowReset(false)}>
          <div className="bg-white rounded-[14px] p-7 max-w-[420px] w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-[22px] text-navy mb-2.5">Start over?</h3>
            <p className="text-[14px] text-muted leading-relaxed mb-6">This will clear every field and checkbox on this template. The data on this device will be erased. This cannot be undone.</p>
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

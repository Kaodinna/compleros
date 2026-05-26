"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/dashboard/Header";
import Link from "next/link";

const STORAGE_KEY = "compleros-template-emergency-contact-form";
const DOC_ID = "CMP-TMP-ECF-001";

type Fields = Record<string, string>;

interface FormField {
  id: string;
  label: string;
  col: number;
  type?: string;
  required?: boolean;
  hint?: string;
}

interface FormGroup {
  label: string;
  fields: FormField[];
}

interface FormSection {
  id: string;
  num: number;
  title: string;
  note?: string;
  fields?: FormField[];
  groups?: FormGroup[];
}

const FORM: FormSection[] = [
  { id: "child", num: 1, title: "Child Information", fields: [
    { id: "childName",     label: "Child's Full Legal Name",  col: 6, required: true },
    { id: "preferredName", label: "Preferred Name",           col: 3, hint: "Optional" },
    { id: "dob",           label: "Date of Birth",            col: 3, type: "date", required: true },
    { id: "gender",        label: "Gender",                   col: 2 },
    { id: "address",       label: "Home Address",             col: 6, required: true },
    { id: "cityZip",       label: "City / Zip",               col: 4, required: true },
    { id: "enrollDate",    label: "Enrollment Date",          col: 3, type: "date" },
    { id: "classroom",     label: "Classroom / Age Group",    col: 3 },
    { id: "daysAttending", label: "Days Attending",           col: 6, hint: "e.g., Mon–Fri, Mon/Wed/Fri" },
  ]},
  { id: "parent1", num: 2, title: "Parent / Guardian 1 (Primary)", fields: [
    { id: "p1Name",     label: "Full Name",                   col: 4, required: true },
    { id: "p1Rel",      label: "Relationship",                col: 4, required: true },
    { id: "p1Dob",      label: "Date of Birth",               col: 4, type: "date" },
    { id: "p1Addr",     label: "Home Address (if different)", col: 6 },
    { id: "p1CityZip",  label: "City / State / Zip",          col: 6 },
    { id: "p1Cell",     label: "Cell Phone",                  col: 3, type: "tel", required: true },
    { id: "p1Work",     label: "Work Phone",                  col: 3, type: "tel" },
    { id: "p1Email",    label: "Email",                       col: 6, type: "email", required: true },
    { id: "p1Employer", label: "Employer",                    col: 4 },
    { id: "p1EmpAddr",  label: "Employer Address",            col: 5 },
    { id: "p1Hours",    label: "Work Hours",                  col: 3 },
  ]},
  { id: "parent2", num: 3, title: "Parent / Guardian 2", fields: [
    { id: "p2Name",  label: "Full Name",    col: 4 },
    { id: "p2Rel",   label: "Relationship", col: 4 },
    { id: "p2Dob",   label: "Date of Birth",col: 4, type: "date" },
    { id: "p2Cell",  label: "Cell Phone",   col: 4, type: "tel" },
    { id: "p2Work",  label: "Work Phone",   col: 4, type: "tel" },
    { id: "p2Email", label: "Email",        col: 4, type: "email" },
  ]},
  { id: "emergency", num: 4, title: "Emergency Contacts", note: "These individuals may be contacted and may pick up your child if parents cannot be reached.", groups: [
    { label: "Contact 1", fields: [{ id: "ec1Name", label: "Full Name", col: 4 }, { id: "ec1Rel", label: "Relationship", col: 3 }, { id: "ec1Ph1", label: "Phone 1", col: 3, type: "tel" }, { id: "ec1Ph2", label: "Phone 2", col: 2, type: "tel" }] },
    { label: "Contact 2", fields: [{ id: "ec2Name", label: "Full Name", col: 4 }, { id: "ec2Rel", label: "Relationship", col: 3 }, { id: "ec2Ph1", label: "Phone 1", col: 3, type: "tel" }, { id: "ec2Ph2", label: "Phone 2", col: 2, type: "tel" }] },
    { label: "Contact 3", fields: [{ id: "ec3Name", label: "Full Name", col: 4 }, { id: "ec3Rel", label: "Relationship", col: 3 }, { id: "ec3Ph1", label: "Phone 1", col: 3, type: "tel" }, { id: "ec3Ph2", label: "Phone 2", col: 2, type: "tel" }] },
  ]},
  { id: "pickup", num: 5, title: "Authorized Pickup Persons", note: "Only these individuals (and parents) may pick up this child. Photo ID will be required.", groups: [
    { label: "Person 1", fields: [{ id: "ap1Name", label: "Name", col: 4 }, { id: "ap1Rel", label: "Relationship", col: 3 }, { id: "ap1Ph", label: "Phone", col: 3, type: "tel" }, { id: "ap1Id", label: "ID Type", col: 2 }] },
    { label: "Person 2", fields: [{ id: "ap2Name", label: "Name", col: 4 }, { id: "ap2Rel", label: "Relationship", col: 3 }, { id: "ap2Ph", label: "Phone", col: 3, type: "tel" }, { id: "ap2Id", label: "ID Type", col: 2 }] },
  ]},
  { id: "restricted", num: 6, title: "Persons NOT Authorized (if applicable)", note: "If a court order restricts access, attach a copy and list restricted individuals.", groups: [
    { label: "", fields: [{ id: "rp1Name", label: "Name", col: 4 }, { id: "rp1Rel", label: "Relationship", col: 3 }, { id: "rp1Reason", label: "Reason / Court Order #", col: 5 }] },
  ]},
  { id: "notes", num: 7, title: "Additional Notes or Special Instructions", fields: [
    { id: "additionalNotes", label: "", col: 12, type: "textarea", hint: "Scheduling preferences, behavioral notes, preferred comforts, etc." },
  ]},
];

function allFieldIds(): string[] {
  const ids: string[] = [];
  for (const sec of FORM) {
    if (sec.fields) sec.fields.forEach((f) => ids.push(f.id));
    if (sec.groups) sec.groups.forEach((g) => g.fields.forEach((f) => ids.push(f.id)));
  }
  return ids;
}

const ALL_FIELDS = allFieldIds();

const COL_CLASS: Record<number, string> = {
  2:  "col-span-12 sm:col-span-2",
  3:  "col-span-12 sm:col-span-3",
  4:  "col-span-12 sm:col-span-4",
  5:  "col-span-12 sm:col-span-5",
  6:  "col-span-12 sm:col-span-6",
  8:  "col-span-12 sm:col-span-8",
  12: "col-span-12",
};

function buildPrintDocument(fields: Fields, today: string): string {
  const esc = (s: string | undefined | null) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));

  const fmtDate = (d: string) => {
    if (!d) return "";
    const p = d.split("-");
    if (p.length < 3) return d;
    return `${p[1]}/${p[2]}/${p[0]}`;
  };

  const row2 = (l1: string, v1: string, l2: string, v2: string) =>
    `<tr><td class="lbl">${esc(l1)}</td><td class="val">${v1 || "&nbsp;"}</td><td class="lbl">${esc(l2)}</td><td class="val">${v2 || "&nbsp;"}</td></tr>`;
  const row1 = (l: string, v: string) =>
    `<tr><td class="lbl">${esc(l)}</td><td class="val" colspan="3">${v || "&nbsp;"}</td></tr>`;
  const sectionTitle = (n: number, t: string) =>
    `<tr><td colspan="4" style="background:#1B4D6B;color:white;font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:4px 8px">${n}. ${esc(t)}</td></tr>`;
  const groupLabel = (l: string) =>
    l ? `<tr><td colspan="4" style="background:#F0EDE6;font-size:8px;font-weight:700;color:#C4985A;text-transform:uppercase;letter-spacing:1px;padding:3px 8px">${esc(l)}</td></tr>` : "";

  const v = (id: string) => fields[id] ? esc(fields[id]) : "";
  const d = (id: string) => fmtDate(fields[id] || "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Emergency Contact Form · Compleros</title>
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { font-family:Arial,Helvetica,sans-serif;color:#2D3748;font-size:9.5px;line-height:1.4; }
    @page { size:letter;margin:12mm 14mm; }
    @media print { * { -webkit-print-color-adjust:exact !important;print-color-adjust:exact !important; } }
    table { width:100%;border-collapse:collapse; }
    td { vertical-align:top; }
    .inner td { padding:4px 8px;border-bottom:1px solid #F0EDE6; }
    .lbl { width:20%;font-size:8.5px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap; }
    .val { width:30%;font-size:9.5px;color:#2D3748;font-weight:500; }
  </style>
</head>
<body>
  <table style="border:none;border-bottom:2px solid #C4985A;margin-bottom:10px">
    <tr>
      <td style="border:none;font-size:20px;font-weight:700;color:#1B4D6B;padding:0">Compleros</td>
      <td style="border:none;text-align:right;padding:0">
        <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#C4985A;margin-bottom:2px">Family &amp; Enrollment Template</div>
        <div style="font-size:14px;font-weight:700;color:#1B4D6B">Emergency Contact Form</div>
      </td>
    </tr>
  </table>
  <table class="inner">
    ${sectionTitle(1, "Child Information")}
    ${row2("Child's Full Legal Name", v("childName"), "Preferred Name", v("preferredName"))}
    ${row2("Date of Birth", d("dob"), "Gender", v("gender"))}
    ${row2("Home Address", v("address"), "City / Zip", v("cityZip"))}
    ${row2("Enrollment Date", d("enrollDate"), "Classroom / Age Group", v("classroom"))}
    ${row2("Days Attending", v("daysAttending"), "", "")}

    ${sectionTitle(2, "Parent / Guardian 1 (Primary)")}
    ${row2("Full Name", v("p1Name"), "Relationship", v("p1Rel"))}
    ${row2("Date of Birth", d("p1Dob"), "Email", v("p1Email"))}
    ${row2("Home Address", v("p1Addr"), "City / State / Zip", v("p1CityZip"))}
    ${row2("Cell Phone", v("p1Cell"), "Work Phone", v("p1Work"))}
    ${row2("Employer", v("p1Employer"), "Work Hours", v("p1Hours"))}
    ${row1("Employer Address", v("p1EmpAddr"))}

    ${sectionTitle(3, "Parent / Guardian 2")}
    ${row2("Full Name", v("p2Name"), "Relationship", v("p2Rel"))}
    ${row2("Date of Birth", d("p2Dob"), "Email", v("p2Email"))}
    ${row2("Cell Phone", v("p2Cell"), "Work Phone", v("p2Work"))}

    ${sectionTitle(4, "Emergency Contacts")}
    ${groupLabel("Contact 1")}
    ${row2("Full Name", v("ec1Name"), "Relationship", v("ec1Rel"))}
    ${row2("Phone 1", v("ec1Ph1"), "Phone 2", v("ec1Ph2"))}
    ${groupLabel("Contact 2")}
    ${row2("Full Name", v("ec2Name"), "Relationship", v("ec2Rel"))}
    ${row2("Phone 1", v("ec2Ph1"), "Phone 2", v("ec2Ph2"))}
    ${groupLabel("Contact 3")}
    ${row2("Full Name", v("ec3Name"), "Relationship", v("ec3Rel"))}
    ${row2("Phone 1", v("ec3Ph1"), "Phone 2", v("ec3Ph2"))}

    ${sectionTitle(5, "Authorized Pickup Persons")}
    ${groupLabel("Person 1")}
    ${row2("Name", v("ap1Name"), "Relationship", v("ap1Rel"))}
    ${row2("Phone", v("ap1Ph"), "ID Type", v("ap1Id"))}
    ${groupLabel("Person 2")}
    ${row2("Name", v("ap2Name"), "Relationship", v("ap2Rel"))}
    ${row2("Phone", v("ap2Ph"), "ID Type", v("ap2Id"))}

    ${sectionTitle(6, "Persons NOT Authorized")}
    ${row2("Name", v("rp1Name"), "Relationship", v("rp1Rel"))}
    ${row1("Reason / Court Order #", v("rp1Reason"))}

    ${sectionTitle(7, "Additional Notes or Special Instructions")}
    ${row1("Notes", v("additionalNotes").replace(/\n/g, "<br>"))}
  </table>

  <table style="border:none;border-top:2px solid #C4985A;margin-top:14px">
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

function FieldInput({ field, value, onChange }: {
  field: FormField;
  value: string;
  onChange: (id: string, v: string) => void;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={field.hint ?? ""}
        rows={3}
        className={`${inputBase} resize-y`}
      />
    );
  }
  return (
    <input
      type={field.type ?? "text"}
      value={value}
      onChange={(e) => onChange(field.id, e.target.value)}
      className={inputBase}
    />
  );
}

function FieldsGrid({ fields, values, onChange }: {
  fields: FormField[];
  values: Fields;
  onChange: (id: string, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-3.5">
      {fields.map((f) => (
        <div key={f.id} className={COL_CLASS[f.col] ?? "col-span-12"}>
          {f.label && (
            <label className="block text-[11.5px] font-semibold text-navy tracking-[0.2px] mb-1.5">
              {f.label}
              {f.required && <span className="text-red-600 ml-0.5"> *</span>}
            </label>
          )}
          <FieldInput field={f} value={values[f.id] ?? ""} onChange={onChange} />
          {f.hint && f.label && (
            <span className="text-[10.5px] text-muted italic mt-1 block">{f.hint}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function EmergencyContactFormPage() {
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

  const filledCount = ALL_FIELDS.filter((id) => (fields[id] ?? "").trim() !== "").length;
  const pct = Math.round((filledCount / ALL_FIELDS.length) * 100);

  const sectionCard = "bg-white border border-[#E5E1D8] rounded-[14px] px-6 sm:px-7 py-6 mb-[18px] shadow-sm";

  return (
    <>
      <Header title="Emergency Contact Form" />

      {/* Action bar */}
      <div className="bg-white border-b border-[#E2DFD8] px-4 sm:px-8 py-3 flex flex-wrap items-center gap-3 sticky top-[60px] z-20 shadow-sm">
        <Link href="/documents" className="flex items-center gap-1.5 text-[13px] text-muted hover:text-navy transition-colors shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Templates
        </Link>
        <span className="text-muted/40 text-[13px]">/</span>
        <span className="text-[13px] text-navy font-medium hidden sm:block">Emergency Contact Form</span>

        {/* Progress */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <div className="flex justify-between text-[11px] font-semibold text-muted">
            <span>Completion</span>
            <span className="text-navy font-bold">{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#E8E4DA] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #C4985A, #D4B07A)" }}
            />
          </div>
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
        <a href="/Compleros_Emergency_Contact_Form.pdf" download className="flex items-center gap-1.5 px-3 py-[9px] border border-[#E2DFD8] rounded-[8px] text-[13px] font-semibold text-navy hover:border-navy hover:bg-[#E8EEF2] transition-colors">
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
          <h1 className="font-heading text-[34px] text-navy leading-[1.1] mb-3">Emergency Contact Form</h1>
          <p className="text-[15px] text-muted leading-[1.6] max-w-[740px]">
            Complete one form per enrolled child. This form collects contact, pickup authorization, and custody restriction information only. Medical and health information must be collected on a separate form and stored outside of Compleros per HIPAA requirements.
          </p>
          <div className="inline-flex items-center gap-2 mt-[18px] px-3.5 py-[9px] bg-[#E8E4DA] rounded-[8px] text-[12.5px] font-medium text-[#475569]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy shrink-0"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span><strong className="text-navy">Your work stays on this device.</strong> Compleros never sees or stores what you type here.</span>
          </div>
        </div>

        {/* Sections */}
        {FORM.map((section) => (
          <div key={section.id} className={sectionCard}>
            {/* Section header */}
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#EEEAE1] mb-[18px]">
              <span className="font-heading text-[13px] text-[#C4985A] bg-[#EFE4D0] rounded-[6px] px-2.5 py-1 shrink-0">{section.num}</span>
              <h2 className="font-heading text-[20px] text-navy leading-tight">{section.title}</h2>
            </div>

            {section.note && (
              <p className="text-[12.5px] text-muted italic mb-4 leading-[1.5]">{section.note}</p>
            )}

            {/* Flat fields */}
            {section.fields && (
              <FieldsGrid fields={section.fields} values={fields} onChange={updateField} />
            )}

            {/* Group fields */}
            {section.groups && section.groups.map((group, gi) => (
              <div
                key={group.label || gi}
                className={gi > 0 ? "border-t border-dashed border-[#E5E1D8] pt-4 mt-4" : ""}
              >
                {group.label && (
                  <div className="text-[12px] font-bold text-muted uppercase tracking-[1px] mb-2.5">{group.label}</div>
                )}
                <FieldsGrid fields={group.fields} values={fields} onChange={updateField} />
              </div>
            ))}
          </div>
        ))}

        {/* Callout */}
        <div className="rounded-[12px] px-6 sm:px-7 py-6 mt-[10px]" style={{ background: "linear-gradient(120deg, #F0EDE6, #F7F5F0)", border: "1px solid rgba(196,152,90,0.3)", borderLeft: "4px solid #C4985A" }}>
          <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#C4985A] mb-2">Track this in Compleros</div>
          <p className="text-[14.5px] text-navy leading-[1.6]">
            Add each child to Compleros to track whether their emergency contact form is on file, current, and complete — without storing the actual form data. Compleros tracks status, never records.
          </p>
        </div>
      </div>

      {/* Reset modal */}
      {showReset && (
        <div className="fixed inset-0 bg-[rgba(19,58,82,0.5)] backdrop-blur-[4px] z-50 flex items-center justify-center p-6" onClick={() => setShowReset(false)}>
          <div className="bg-white rounded-[14px] p-7 max-w-[420px] w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-[22px] text-navy mb-2.5">Start over?</h3>
            <p className="text-[14px] text-muted leading-[1.55] mb-6">This clears all form data on this device. This action cannot be undone.</p>
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

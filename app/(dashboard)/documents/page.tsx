"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/dashboard/Header";
import Link from "next/link";
import SeePlansButton from "@/components/dashboard/SeePlansButton";

const FREE_STORAGE_BYTES = 250 * 1024 * 1024;

const FOLDERS = ["Licenses & Permits", "Staff Records", "Policies", "Other"];

const FILE_BADGE: Record<"DOCX" | "XLSX" | "PDF", string> = {
  DOCX: "bg-[#E8F1FB] text-[#1E5BAA]",
  XLSX: "bg-[#E8F5EC] text-[#1F7A3D]",
  PDF:  "bg-[#FBEAEA] text-[#B3261E]",
};

interface TemplateItem {
  name: string;
  fileType: "DOCX" | "XLSX" | "PDF";
  meta: string;
  desc: string;
  href?: string;
  icon: React.ReactNode;
}

const TEMPLATE_CATEGORIES: { label: string; desc: string; icon: React.ReactNode; templates: TemplateItem[] }[] = [
  {
    label: "Licensing & Application",
    desc: "Get your facility licensed and stay ready for renewals",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>,
    templates: [
      { name: "DCF Facility License Application Checklist", fileType: "DOCX" as const, meta: "3 pages · Updated Apr 2026", desc: "A section-by-section checklist covering everything DCF expects in a new license application — forms, facility docs, staff credentials, and operating policies.", href: "/documents/dcf-checklist", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
    ],
  },
  {
    label: "Staff Management",
    desc: "Track credentials, screenings, and training in one place",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    templates: [
      { name: "Staff Credential Tracking Sheet", fileType: "XLSX" as const, meta: "1 workbook · Updated Apr 2026", desc: "A ready-to-use spreadsheet for logging every staff member's credentials, Level 2 screenings, training hours, and upcoming renewal dates.", href: "/documents/staff-credential-tracker", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="14" x2="9" y2="18"/><line x1="13" y1="14" x2="13" y2="18"/><line x1="17" y1="14" x2="17" y2="18"/></svg> },
    ],
  },
  {
    label: "Family & Enrollment",
    desc: "Forms families complete at enrollment and throughout the year",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    templates: [
      { name: "Emergency Contact Form", fileType: "PDF" as const, meta: "2 pages · Fillable", desc: "A fillable PDF for parents to list emergency contacts, authorized pickups, and medical information. Required on file for every enrolled child.", href: "/documents/emergency-contact-form", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
      { name: "Parent Authorization Form", fileType: "PDF" as const, meta: "2 pages · Fillable", desc: "A consent form covering photo release, field trips, sunscreen, emergency medical treatment, and transportation. One signature, every permission you need.", href: "/documents/parent-authorization-form", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
    ],
  },
  {
    label: "Daily Operations",
    desc: "Enrollment tracking and operational compliance logs",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    templates: [
      { name: "Enrollment Document Checklist", fileType: "XLSX" as const, meta: "Per-child tracker · Updated Apr 2026", desc: "Track which enrollment documents are on file for each child — emergency contacts, authorizations, immunizations, and more. Status only, no records stored.", href: "/documents/enrollment-document-checklist", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><path d="M9 14l2 2 4-4"/></svg> },
    ],
  },
];

const LOCKED_TEMPLATE_CARDS = [
  { name: "Mock DCF Inspection Scoring Worksheet", fileType: "DOCX" as const, meta: "8 pages", desc: "Full 88-item DCF inspection rubric with scoring logic, gap analysis, and remediation prompts — the same framework used in the Compleros mock inspection tool.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><path d="M9 14l2 2 4-4"/></svg> },
  { name: "Incident & Accident Report Form", fileType: "DOCX" as const, meta: "3 pages · Fillable", desc: "A DCF-compliant incident reporting template with parent notification, witness statements, and follow-up action tracking.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { name: "Fire Drill & Emergency Log", fileType: "DOCX" as const, meta: "12-month log", desc: "Monthly fire drill documentation plus emergency preparedness logs for lockdown, severe weather, and evacuation scenarios.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> },
  { name: "Staff Training Hours Tracker", fileType: "XLSX" as const, meta: "Dynamic workbook", desc: "Track the 40-hour DCF introductory course and 10-hour annual in-service requirement per staff member with auto-calculated progress.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
  { name: "Ratio Compliance Monitoring Log", fileType: "XLSX" as const, meta: "Daily tracker", desc: "Classroom-level staff-to-child ratio tracker pre-loaded with DCF age-group thresholds and automatic violation flags.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { name: "Medication Administration Log", fileType: "PDF" as const, meta: "2 pages · Fillable", desc: "Parent authorization, dosage tracking, and administration records — meets DCF documentation standards for medication handling.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/><rect x="9" y="2" width="6" height="9"/></svg> },
];

interface Doc { id: string; name: string; folder: string; storage_path: string; size_bytes: number; created_at: string; }

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function fileExt(name: string) { return name.split(".").pop()?.toUpperCase() ?? "FILE"; }

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return { emoji: "📄", bg: "bg-[#FEF2F2]" };
  if (["doc","docx"].includes(ext)) return { emoji: "📝", bg: "bg-[#EFF6FF]" };
  if (["jpg","jpeg","png","gif"].includes(ext)) return { emoji: "🖼️", bg: "bg-[#F0FDF4]" };
  return { emoji: "📁", bg: "bg-cream" };
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"my" | "templates">("my");
  const [view, setView] = useState<"card" | "table">("card");
  const [activeFolder, setActiveFolder] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("Licenses & Permits");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setDocs(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const totalBytes = docs.reduce((s, d) => s + d.size_bytes, 0);
  const usedPct = Math.min((totalBytes / FREE_STORAGE_BYTES) * 100, 100);
  const remainingMB = ((FREE_STORAGE_BYTES - totalBytes) / (1024 * 1024)).toFixed(1);

  const filtered = activeFolder === "all" ? docs : docs.filter(d => d.folder === activeFolder);

  const openUpload = (f?: File) => {
    if (f) setPendingFile(f);
    setShowUploadModal(true);
  };

  const doUpload = async () => {
    const file = pendingFile;
    if (!file) return;
    if (totalBytes + file.size > FREE_STORAGE_BYTES) { setUploadError("Storage limit reached."); return; }
    setUploading(true); setUploadError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
    if (upErr) { setUploadError(upErr.message); setUploading(false); return; }
    await supabase.from("documents").insert({ user_id: user.id, name: file.name, folder: uploadFolder, storage_path: path, size_bytes: file.size });
    await supabase.from("activity_log").insert({ user_id: user.id, icon: "📁", description: `Uploaded ${file.name}` });
    if (fileRef.current) fileRef.current.value = "";
    setPendingFile(null); setShowUploadModal(false); setUploading(false); load();
  };

  const deleteDoc = async (doc: Doc) => {
    if (!confirm(`Delete "${doc.name}"?`)) return;
    await supabase.storage.from("documents").remove([doc.storage_path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    load();
  };

  const downloadDoc = async (doc: Doc) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(doc.storage_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const renameDoc = async (doc: Doc) => {
    const newName = prompt("New file name:", doc.name);
    if (!newName || newName === doc.name) return;
    await supabase.from("documents").update({ name: newName.trim() }).eq("id", doc.id);
    load();
  };

  return (
    <>
      <Header title="Document Management" />
      <div className="p-4 sm:p-[24px_28px] space-y-5">

        {/* Storage Bar */}
        <div className="bg-white border border-[#E2DFD8] rounded-[12px] px-[22px] py-[18px]">
          <div className="flex justify-between items-center">
            <div className="text-[13px] font-semibold text-navy">Storage Usage</div>
            <div className="text-[12px] text-muted">{formatBytes(totalBytes)} <span className="text-muted/60">/ 250 MB</span></div>
          </div>
          <div className="h-2 bg-cream rounded-full overflow-hidden my-2.5">
            <div className="h-full bg-[#2E7D52] rounded-full transition-all" style={{ width: `${usedPct}%` }} />
          </div>
          <div className="text-[11px] text-muted">
            {remainingMB} MB remaining ·{" "}
            <SeePlansButton className="text-gold no-underline hover:text-[#A87D42] transition-colors">
              Upgrade to Basic for 5 GB →
            </SeePlansButton>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E2DFD8]">
          {[{ id: "my", label: "My Documents" }, { id: "templates", label: "Templates" }].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as "my" | "templates")}
              className={`px-5 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id ? "text-navy border-navy font-semibold" : "text-muted border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* MY DOCUMENTS TAB */}
        {tab === "my" && (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => { setPendingFile(null); setShowUploadModal(true); }}
                  className="bg-navy text-white rounded-[7px] px-3 py-1.5 text-[11px] font-semibold hover:bg-[#143A52] transition-colors"
                >
                  + Upload File
                </button>
                <button
                  onClick={() => setShowFolderModal(true)}
                  className="border border-[#E2DFD8] rounded-[7px] px-3 py-1.5 text-[11px] font-semibold text-[#2D2D2D] hover:border-navy hover:text-navy transition-colors"
                >
                  📁 New Folder
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[12px] text-muted">{filtered.length} file{filtered.length !== 1 ? "s" : ""}</span>
                <div className="flex border border-[#E2DFD8] rounded-[7px] overflow-hidden">
                  <button onClick={() => setView("card")} className={`px-[11px] py-1.5 text-[13px] border-none cursor-pointer transition-colors leading-none ${view === "card" ? "bg-navy text-white" : "bg-white text-muted hover:bg-cream hover:text-[#2D2D2D]"}`}>▦</button>
                  <button onClick={() => setView("table")} className={`px-[11px] py-1.5 text-[13px] border-none cursor-pointer transition-colors leading-none ${view === "table" ? "bg-navy text-white" : "bg-white text-muted hover:bg-cream hover:text-[#2D2D2D]"}`}>☰</button>
                </div>
              </div>
            </div>

            {/* Folder chips */}
            <div className="flex gap-2 flex-wrap">
              {[{ id: "all", label: "🗂️ All Files" }, ...FOLDERS.map(f => ({ id: f, label: f }))].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFolder(f.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-[7px] rounded-[8px] text-[12px] border transition-colors ${
                    activeFolder === f.id ? "bg-navy border-navy text-white" : "bg-white border-[#E2DFD8] text-[#2D2D2D] hover:border-gold hover:bg-[#FFFBF0]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Hidden file input */}
            <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) openUpload(f); }} />

            {/* Card View */}
            {view === "card" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {loading ? (
                  <div className="col-span-3 text-center py-10 text-[13px] text-muted">Loading…</div>
                ) : filtered.length === 0 ? (
                  <div className="col-span-3 text-center py-10 text-[13px] text-muted">No files in this folder.</div>
                ) : filtered.map(doc => {
                  const { emoji, bg } = fileIcon(doc.name);
                  return (
                    <div key={doc.id} className="bg-white border border-[#E2DFD8] rounded-[10px] p-4 hover:border-[#D4AD74] hover:shadow-sm transition-all">
                      <div className={`w-10 h-10 rounded-[8px] ${bg} flex items-center justify-center text-[18px] mb-2.5`}>{emoji}</div>
                      <div className="text-[13px] font-semibold text-[#2D2D2D] truncate mb-1">{doc.name}</div>
                      <div className="text-[11px] text-muted">{formatBytes(doc.size_bytes)} · {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {doc.folder}</div>
                      <div className="flex items-center gap-1 mt-1.5 opacity-50">
                        <span className="text-[10px] text-muted">🔒 Expiry tracking · Basic</span>
                      </div>
                      <div className="flex gap-1.5 mt-2.5 pt-2.5 border-t border-[#E2DFD8]">
                        <button onClick={() => downloadDoc(doc)} className="flex-1 py-1.5 text-[11px] border border-[#E2DFD8] rounded-[5px] bg-white text-muted hover:border-navy hover:text-navy transition-colors">⬇ Download</button>
                        <button onClick={() => renameDoc(doc)} className="flex-1 py-1.5 text-[11px] border border-[#E2DFD8] rounded-[5px] bg-white text-muted hover:border-navy hover:text-navy transition-colors">✏️ Rename</button>
                        <button onClick={() => deleteDoc(doc)} className="flex-1 py-1.5 text-[11px] border border-[#E2DFD8] rounded-[5px] bg-white text-muted hover:border-red-300 hover:text-red-500 transition-colors">🗑 Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table View */}
            {view === "table" && (
              <div className="overflow-hidden border border-[#E2DFD8] rounded-[10px] bg-white">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-cream">
                      {["File Name", "Type", "Size", "Uploaded", "Folder", "Expiry", "Actions"].map(h => (
                        <th key={h} className="px-3.5 py-2.5 text-[11px] font-semibold text-navy text-left uppercase tracking-[0.5px] border-b border-[#E2DFD8] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(doc => {
                      const { emoji, bg } = fileIcon(doc.name);
                      return (
                        <tr key={doc.id} className="hover:bg-[#FAFAF8] border-b border-[#F3F2EF] last:border-none">
                          <td className="px-3.5 py-3 text-[13px] max-w-[240px]">
                            <span className={`inline-flex w-7 h-7 rounded-[6px] ${bg} items-center justify-center text-[13px] mr-2 align-middle shrink-0`}>{emoji}</span>
                            <span className="font-medium text-[#2D2D2D] truncate align-middle">{doc.name}</span>
                          </td>
                          <td className="px-3.5 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cream text-muted">{fileExt(doc.name)}</span></td>
                          <td className="px-3.5 py-3 text-[13px] text-[#2D2D2D]">{formatBytes(doc.size_bytes)}</td>
                          <td className="px-3.5 py-3 text-[13px] text-[#2D2D2D]">{new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td className="px-3.5 py-3 text-[13px] text-[#2D2D2D]">{doc.folder}</td>
                          <td className="px-3.5 py-3"><span className="text-[10px] text-muted opacity-50">🔒 Basic</span></td>
                          <td className="px-3.5 py-3">
                            <div className="flex gap-1.5">
                              <button onClick={() => downloadDoc(doc)} className="px-2.5 py-1 text-[11px] border border-[#E2DFD8] rounded-[5px] bg-white text-muted hover:border-navy hover:text-navy transition-colors whitespace-nowrap">⬇</button>
                              <button onClick={() => renameDoc(doc)} className="px-2.5 py-1 text-[11px] border border-[#E2DFD8] rounded-[5px] bg-white text-muted hover:border-navy hover:text-navy transition-colors">✏️</button>
                              <button onClick={() => deleteDoc(doc)} className="px-2.5 py-1 text-[11px] border border-[#E2DFD8] rounded-[5px] bg-white text-muted hover:border-red-300 hover:text-red-500 transition-colors">🗑</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && !loading && (
                  <div className="text-center py-10 text-[13px] text-muted">No files in this folder.</div>
                )}
              </div>
            )}

            {/* Upload Zone */}
            <div
              className="border-2 border-dashed border-[#E2DFD8] rounded-[12px] p-9 text-center cursor-pointer hover:border-gold hover:bg-[#FFFBF0] transition-colors bg-white"
              onClick={() => { setPendingFile(null); setShowUploadModal(true); }}
            >
              <div className="text-[32px] mb-2.5">☁️</div>
              <h4 className="text-[14px] font-semibold text-navy mb-1">Drag & drop files here</h4>
              <p className="text-[12px] text-muted">PDF, DOC, DOCX, JPG, PNG · Max 10 MB per file</p>
              <button className="mt-3.5 border border-[#E2DFD8] rounded-[9px] px-[18px] py-2 text-[12px] font-semibold text-[#2D2D2D] hover:border-navy hover:text-navy transition-colors">
                Browse Files
              </button>
            </div>

            {/* Gate */}
            <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[18px] py-3.5 flex flex-wrap items-center gap-3">
              <span className="text-[16px]">🔒</span>
              <div className="flex-1 min-w-[180px]">
                <h4 className="text-[13px] font-semibold text-navy">Track Document Expiration Dates</h4>
                <p className="text-[12px] text-muted">Set expiry dates on policies, permits, and certifications. Get alerts before they lapse. Available on Basic.</p>
              </div>
              <SeePlansButton className="shrink-0 bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">
                See Plans
              </SeePlansButton>
            </div>
          </>
        )}

        {/* TEMPLATES TAB */}
        {tab === "templates" && (
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-6 mb-6 border-b border-[#E2DFD8]">
              <div>
                <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2.5">Compliance Toolkit</div>
                <h2 className="font-heading text-[28px] sm:text-[32px] text-navy leading-tight mb-2">
                  Templates <span className="italic text-gold">library</span>
                </h2>
                <p className="text-[13px] text-muted leading-relaxed max-w-[500px]">
                  Printable, fillable, and ready to use. Every template is built around Florida DCF requirements. Download what you need and track compliance in Compleros.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <div className="bg-white border border-[#E2DFD8] rounded-[12px] px-4 py-3.5 text-center min-w-[90px]">
                  <div className="font-heading text-[24px] font-bold text-navy leading-none mb-1">5</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-muted">Free Templates</div>
                </div>
                <div className="bg-[#FFFBF0] border border-[rgba(196,152,90,0.3)] rounded-[12px] px-4 py-3.5 text-center min-w-[90px]">
                  <div className="font-heading text-[24px] font-bold text-gold leading-none mb-1">20+</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-muted">With Basic</div>
                </div>
              </div>
            </div>

            {/* Info bar */}
            <div className="flex items-start gap-3 bg-[#E8EEF2] border border-[#D6E0E8] rounded-[10px] px-4 py-3.5 mb-8">
              <svg className="shrink-0 mt-0.5 text-navy" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p className="text-[12.5px] text-navy leading-relaxed">
                <strong>Compleros doesn&apos;t store your records — it makes sure you have them.</strong> Download each template, complete it offline, and keep your originals where you store your records today.
              </p>
            </div>

            {/* Free template categories */}
            {TEMPLATE_CATEGORIES.map(cat => (
              <section key={cat.label} className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-[10px] bg-white border border-[#E2DFD8] flex items-center justify-center text-navy shrink-0">
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-heading text-[18px] text-navy">{cat.label}</div>
                    <div className="text-[12px] text-muted mt-0.5">{cat.desc}</div>
                  </div>
                  <span className="text-[11px] font-semibold text-muted bg-[#EBE9E3] rounded-full px-3 py-1 shrink-0">
                    {cat.templates.length} template{cat.templates.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.templates.map(t => (
                    <div key={t.name} className="group relative bg-white border border-[#E2DFD8] rounded-[14px] p-[22px] flex flex-col gap-3.5 transition-all duration-200 hover:-translate-y-[3px] hover:border-gold hover:shadow-lg overflow-hidden cursor-pointer">
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold to-[#D4B07A] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-[52px] h-[52px] rounded-[10px] bg-cream border border-[#E2DFD8] flex items-center justify-center text-navy shrink-0">
                          {t.icon}
                        </div>
                        <span className={`inline-flex px-2.5 py-[5px] rounded-[6px] text-[11px] font-bold tracking-[0.5px] ${FILE_BADGE[t.fileType]}`}>
                          {t.fileType}
                        </span>
                      </div>
                      <h3 className="font-heading text-[17px] text-navy leading-snug">{t.name}</h3>
                      <p className="text-[12.5px] text-muted leading-relaxed flex-1">{t.desc}</p>
                      <div className="flex items-center justify-between gap-2 pt-3.5 border-t border-[#E8E6E0]">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted font-medium">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                          {t.meta}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button className="flex items-center gap-1 bg-white border border-[#E2DFD8] text-navy rounded-[7px] px-2.5 py-[7px] text-[11.5px] font-semibold hover:border-navy hover:bg-cream transition-all">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            PDF
                          </button>
                          {t.href ? (
                            <Link href={t.href} className="flex items-center gap-1 bg-navy text-white rounded-[7px] px-2.5 py-[7px] text-[11.5px] font-semibold hover:bg-[#143A52] transition-colors">
                              Open
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
                            </Link>
                          ) : (
                            <button disabled className="flex items-center gap-1 bg-navy/40 text-white rounded-[7px] px-2.5 py-[7px] text-[11.5px] font-semibold cursor-not-allowed">
                              Open
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Locked templates */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-[10px] bg-[#EFE4D0] border border-[rgba(196,152,90,0.3)] flex items-center justify-center text-gold shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-heading text-[18px] text-navy">Unlock with Basic</div>
                  <div className="text-[12px] text-muted mt-0.5">Advanced compliance templates for growing programs</div>
                </div>
                <span className="text-[11px] font-semibold text-gold bg-[#EFE4D0] rounded-full px-3 py-1 shrink-0">Basic plan</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LOCKED_TEMPLATE_CARDS.map(t => (
                  <div key={t.name} className="relative bg-gradient-to-br from-[#FAFAF8] to-[#F3F0E8] border border-[#E2DFD8] rounded-[14px] p-[22px] flex flex-col gap-3.5">
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 bg-navy text-[#D4AD74] rounded-full px-2.5 py-[5px] text-[10px] font-bold uppercase tracking-[1.2px] shadow-md z-10">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Basic
                    </div>
                    <div className="flex items-start justify-between gap-3 opacity-45">
                      <div className="w-[52px] h-[52px] rounded-[10px] bg-cream border border-[#E2DFD8] flex items-center justify-center text-navy shrink-0">
                        {t.icon}
                      </div>
                      <span className={`inline-flex px-2.5 py-[5px] rounded-[6px] text-[11px] font-bold tracking-[0.5px] ${FILE_BADGE[t.fileType]}`}>
                        {t.fileType}
                      </span>
                    </div>
                    <h3 className="font-heading text-[17px] text-navy leading-snug opacity-45">{t.name}</h3>
                    <p className="text-[12.5px] text-muted leading-relaxed flex-1 opacity-45">{t.desc}</p>
                    <div className="flex items-center justify-between gap-2 pt-3.5 border-t border-[#E8E6E0]">
                      <span className="text-[11px] text-muted font-medium">{t.meta}</span>
                      <SeePlansButton className="inline-flex items-center gap-1.5 text-gold border border-gold rounded-[7px] px-3 py-[7px] text-[12px] font-semibold hover:bg-gold hover:text-white transition-colors">
                        Unlock
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </SeePlansButton>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Upgrade banner */}
            <div className="relative bg-gradient-to-br from-[#1B4D6B] via-[#133A52] to-[#0D2A3D] rounded-[18px] p-7 sm:p-10 overflow-hidden">
              <div className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,rgba(196,152,90,0.25)_0%,transparent_65%)] pointer-events-none" />
              <div className="absolute bottom-[-60px] left-[40%] w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(42,106,143,0.4)_0%,transparent_65%)] pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div className="flex-1">
                  <div className="inline-block text-[11px] font-bold tracking-[2px] uppercase text-[#D4B07A] bg-[rgba(196,152,90,0.15)] border border-[rgba(196,152,90,0.3)] rounded-full px-3 py-1.5 mb-5">
                    Upgrade to Basic
                  </div>
                  <h2 className="font-heading text-[24px] sm:text-[28px] text-white leading-tight mb-3">
                    Stop chasing deadlines. <span className="italic text-[#D4B07A]">Let Compleros do it.</span>
                  </h2>
                  <p className="text-[13px] text-white/70 leading-relaxed mb-5 max-w-[500px]">
                    Basic unlocks 20+ compliance templates, automated expiration alerts across every credential and license, and the full mock DCF inspection tool.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["20+ premium templates", "Automated alerts", "Mock DCF inspection", "Up to 50 staff"].map(f => (
                      <span key={f} className="inline-flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.10] rounded-full px-3 py-1.5 text-[12px] text-white/85 font-medium">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4B07A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-center sm:text-right shrink-0">
                  <div className="mb-4">
                    <div className="font-heading text-[50px] text-white leading-none tracking-[-2px]">$25</div>
                    <div className="text-[12px] text-white/60 mt-1">per month · or $240/yr</div>
                  </div>
                  <SeePlansButton className="inline-flex items-center gap-2 bg-gold text-white rounded-[10px] px-6 py-3.5 text-[14px] font-semibold hover:bg-[#B88A4E] transition-colors shadow-[0_8px_24px_rgba(196,152,90,0.3)]">
                    Upgrade Now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </SeePlansButton>
                  <div className="text-[11.5px] text-white/45 mt-3">Cancel anytime</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-[18px] p-8 w-full max-w-[460px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-[18px] font-semibold text-navy mb-4">Upload Document</h2>
            <div
              className="border-2 border-dashed border-[#E2DFD8] rounded-[10px] p-7 text-center mb-4 bg-cream cursor-pointer hover:border-gold transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <div className="text-[28px] mb-2">📁</div>
              <div className="text-[13px] font-medium text-navy mb-1">{pendingFile ? pendingFile.name : "Drop file here or click to browse"}</div>
              <div className="text-[11px] text-muted">PDF, DOC, DOCX, JPG, PNG · Max 10 MB</div>
            </div>
            <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setPendingFile(f); }} />
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-navy mb-1.5">Assign to Folder</label>
              <select value={uploadFolder} onChange={e => setUploadFolder(e.target.value)} className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy bg-white">
                {FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="mb-4 opacity-50">
              <label className="block text-[12px] font-semibold text-navy mb-1.5">Expiration Date <span className="text-[10px] text-[#A87D42] font-normal">🔒 Basic</span></label>
              <input type="date" disabled placeholder="Track expiry on Basic" className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] cursor-not-allowed bg-[#F8F7F4]" />
            </div>
            {uploadError && <p className="text-[13px] text-red-600 mb-3">{uploadError}</p>}
            <div className="flex gap-2.5">
              <button onClick={doUpload} disabled={uploading || !pendingFile} className="flex-1 bg-navy text-white rounded-[9px] py-3 text-[14px] font-semibold disabled:opacity-50 hover:bg-[#143A52] transition-colors">
                {uploading ? "Uploading…" : "Upload File"}
              </button>
              <button onClick={() => { setShowUploadModal(false); setPendingFile(null); }} className="border border-[#E2DFD8] rounded-[9px] px-5 py-3 text-[14px] font-semibold text-[#2D2D2D] hover:border-navy transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={() => setShowFolderModal(false)}>
          <div className="bg-white rounded-[18px] p-8 w-full max-w-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-[18px] font-semibold text-navy mb-4">New Folder</h2>
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-navy mb-1.5">Folder Name</label>
              <input placeholder="e.g., Insurance Policies" className="w-full px-[15px] py-[11px] border border-[#E2DFD8] rounded-[8px] text-[13px] focus:outline-none focus:border-navy" />
            </div>
            <div className="flex gap-2.5">
              <button className="flex-1 bg-navy text-white rounded-[9px] py-3 text-[14px] font-semibold hover:bg-[#143A52] transition-colors" onClick={() => setShowFolderModal(false)}>Create Folder</button>
              <button onClick={() => setShowFolderModal(false)} className="border border-[#E2DFD8] rounded-[9px] px-5 py-3 text-[14px] font-semibold text-[#2D2D2D] hover:border-navy transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

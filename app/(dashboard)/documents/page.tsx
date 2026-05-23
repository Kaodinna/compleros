"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/dashboard/Header";
import Link from "next/link";

const FREE_STORAGE_BYTES = 250 * 1024 * 1024;

const FOLDERS = ["Licenses & Permits", "Staff Records", "Policies", "Other"];

const FREE_TEMPLATES = [
  { icon: "📋", name: "DCF Facility License Application Checklist", desc: "Step-by-step checklist for preparing your DCF license application." },
  { icon: "👥", name: "Staff Credential Tracking Sheet", desc: "Spreadsheet template to manually track CPR, background check, and training status." },
  { icon: "📞", name: "Emergency Contact Form", desc: "Parent-facing form for collecting emergency contact information." },
  { icon: "✍️", name: "Parent Authorization Form", desc: "General-purpose authorization form for field trips, photos, and medical release." },
  { icon: "🩺", name: "Daily Health Screening Log", desc: "Log for recording daily health checks per DCF/DOH requirements." },
];

const LOCKED_TEMPLATES = [
  { icon: "🚨", name: "Incident & Accident Report", desc: "DCF-compliant incident report template. Available on Basic." },
  { icon: "📊", name: "Staff-to-Child Ratio Worksheet", desc: "Daily ratio compliance calculator. Available on Basic." },
  { icon: "📁", name: "+ 13 more templates", desc: "Policies, inspection prep, student records, and more. Available on Basic." },
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
      <div className="p-[24px_28px] space-y-5">

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
            <Link href="/pricing" className="text-gold no-underline hover:text-[#A87D42] transition-colors">
              Upgrade to Basic for 5 GB →
            </Link>
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
            <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[18px] py-3.5 flex items-center gap-3">
              <span className="text-[16px]">🔒</span>
              <div className="flex-1">
                <h4 className="text-[13px] font-semibold text-navy">Track Document Expiration Dates</h4>
                <p className="text-[12px] text-muted">Set expiry dates on policies, permits, and certifications. Get alerts before they lapse. Available on Basic.</p>
              </div>
              <Link href="/pricing" className="shrink-0 bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">
                See Plans
              </Link>
            </div>
          </>
        )}

        {/* TEMPLATES TAB */}
        {tab === "templates" && (
          <div>
            <div className="text-[13px] text-muted mb-4">
              5 starter templates included on Free ·{" "}
              <Link href="/pricing" className="text-gold font-medium hover:text-[#A87D42]">15+ more available on Basic</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FREE_TEMPLATES.map(t => (
                <div key={t.name} className="bg-white border border-[#E2DFD8] rounded-[10px] p-[18px] hover:border-[#D4AD74] transition-colors">
                  <div className="w-full h-[72px] rounded-[6px] bg-cream flex items-center justify-center text-[26px] mb-3">{t.icon}</div>
                  <div className="text-[13px] font-semibold text-navy mb-1">{t.name}</div>
                  <div className="text-[11px] text-muted leading-relaxed mb-3">{t.desc}</div>
                  <button className="bg-navy text-white rounded-[7px] px-3 py-1.5 text-[11px] font-semibold hover:bg-[#143A52] transition-colors">⬇ Download</button>
                </div>
              ))}
              {LOCKED_TEMPLATES.map(t => (
                <div key={t.name} className="bg-white border border-[#E2DFD8] rounded-[10px] p-[18px] opacity-55 cursor-not-allowed">
                  <div className="w-full h-[72px] rounded-[6px] bg-cream flex items-center justify-center text-[26px] mb-3">{t.icon}</div>
                  <div className="text-[13px] font-semibold text-navy mb-1">{t.name}</div>
                  <div className="text-[11px] text-muted leading-relaxed mb-3">{t.desc}</div>
                  <Link href="/pricing" className="inline-block border border-[#E2DFD8] rounded-[7px] px-3 py-1.5 text-[11px] font-semibold text-[#2D2D2D] hover:border-navy transition-colors">🔒 Unlock</Link>
                </div>
              ))}
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

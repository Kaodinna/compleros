"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import {
  PageHeader, StatCard, TierBadge, Btn,
  PanelSection, PanelRow, DetailGrid, DetailItem,
  SearchBar, FilterPill, AdminTable, EmptyState,
} from "@/components/admin/admin-ui";

type DocStatus = "verified" | "pending" | "rejected" | "expired";
type DocType = "DCF License" | "Background Screening" | "Staff Credential" | "Fire Inspection" | "Health Inspection" | "CPR / First Aid" | "VPK Contract" | "Insurance Certificate";

interface Document {
  id: string;
  name: string;
  provider: string;
  tier: "free" | "basic" | "premium";
  docType: DocType;
  uploaded: string;
  size: string;
  status: DocStatus;
}

const DOCUMENTS: Document[] = [
  { id: "1",  name: "DCF_License_2026_Sunshine.pdf",          provider: "Sunshine Early Learning",     tier: "premium", docType: "DCF License",             uploaded: "Apr 6, 2026",  size: "184 KB", status: "verified" },
  { id: "2",  name: "Palm_Academy_DCF_Inspection_Apr2026.pdf", provider: "Palm Academy",                tier: "basic",   docType: "DCF License",             uploaded: "Apr 7, 2026",  size: "321 KB", status: "pending" },
  { id: "3",  name: "BG_Screening_JSmith_Coastal.pdf",        provider: "Coastal Kids Academy",        tier: "basic",   docType: "Background Screening",    uploaded: "Apr 5, 2026",  size: "98 KB",  status: "verified" },
  { id: "4",  name: "FireInspection_2026_Starfish.pdf",        provider: "Starfish Childcare",          tier: "premium", docType: "Fire Inspection",         uploaded: "Apr 3, 2026",  size: "214 KB", status: "verified" },
  { id: "5",  name: "Staff_Cred_MJohnson_BHP.pdf",            provider: "Bright Horizons Prep",        tier: "premium", docType: "Staff Credential",        uploaded: "Mar 31, 2026", size: "74 KB",  status: "expired" },
  { id: "6",  name: "CPR_Cert_2026_FirstSteps.pdf",           provider: "First Steps Academy",         tier: "basic",   docType: "CPR / First Aid",         uploaded: "Apr 2, 2026",  size: "61 KB",  status: "pending" },
  { id: "7",  name: "VPK_Contract_2026_Heritage.pdf",         provider: "Heritage Oak Academy",        tier: "basic",   docType: "VPK Contract",            uploaded: "Mar 28, 2026", size: "442 KB", status: "verified" },
  { id: "8",  name: "Insurance_2026_Sunrise.pdf",             provider: "Sunrise Learning Center",     tier: "premium", docType: "Insurance Certificate",   uploaded: "Mar 25, 2026", size: "156 KB", status: "verified" },
  { id: "9",  name: "HealthInspection_GulfCoast_Q1.pdf",      provider: "Gulf Coast Montessori",       tier: "basic",   docType: "Health Inspection",       uploaded: "Mar 20, 2026", size: "289 KB", status: "rejected" },
  { id: "10", name: "BG_Screen_Staff_Manatee_Apr2026.pdf",    provider: "Manatee County Family Center",tier: "free",    docType: "Background Screening",    uploaded: "Apr 8, 2026",  size: "112 KB", status: "pending" },
  { id: "11", name: "DCF_License_Magnolia_2026.pdf",          provider: "Magnolia Early Education",    tier: "basic",   docType: "DCF License",             uploaded: "Apr 4, 2026",  size: "198 KB", status: "verified" },
  { id: "12", name: "Staff_Cred_LWilliams_Cedar.pdf",         provider: "Cedar Ridge Learning",        tier: "basic",   docType: "Staff Credential",        uploaded: "Apr 1, 2026",  size: "88 KB",  status: "pending" },
  { id: "13", name: "FireInspect_SeaBreezeAcad_2026.pdf",     provider: "Seabreeze Academy",           tier: "premium", docType: "Fire Inspection",         uploaded: "Mar 30, 2026", size: "176 KB", status: "verified" },
  { id: "14", name: "VPK_Contract_Discovery_2026.pdf",        provider: "Discovery Tree School",       tier: "free",    docType: "VPK Contract",            uploaded: "Mar 22, 2026", size: "389 KB", status: "verified" },
  { id: "15", name: "CPR_Palm_Staff_Q1_2026.pdf",             provider: "Palm Academy",                tier: "basic",   docType: "CPR / First Aid",         uploaded: "Mar 15, 2026", size: "55 KB",  status: "expired" },
];

const statusConfig: Record<DocStatus, { bg: string; dot: string; label: string }> = {
  verified: { bg: "bg-success/10 text-success",     dot: "bg-success",     label: "Verified" },
  pending:  { bg: "bg-warning/10 text-warning",     dot: "bg-warning",     label: "Pending Review" },
  rejected: { bg: "bg-danger/10 text-danger",       dot: "bg-danger",      label: "Rejected" },
  expired:  { bg: "bg-muted/10 text-muted",         dot: "bg-muted",       label: "Expired" },
};

function DocStatusPill({ status }: { status: DocStatus }) {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-[10px] py-[3px] rounded-full text-[0.72rem] font-semibold ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function FileIcon() {
  return (
    <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
    </svg>
  );
}

export default function DocumentsPage() {
  const { showToast, openPanel, closePanel } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DocStatus>("all");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const docTypes = ["All Types", ...Array.from(new Set(DOCUMENTS.map((d) => d.docType)))];

  const filtered = DOCUMENTS.filter((d) => {
    const q = search.toLowerCase();
    if (q && !d.name.toLowerCase().includes(q) && !d.provider.toLowerCase().includes(q)) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (typeFilter !== "All Types" && d.docType !== typeFilter) return false;
    return true;
  });

  const openDocPanel = (doc: Document) => {
    openPanel({
      title: doc.name,
      subtitle: doc.provider,
      body: (
        <div>
          <PanelSection title="Document Details">
            <DetailGrid>
              <DetailItem label="Type" value={doc.docType} />
              <DetailItem label="Provider" value={doc.provider} />
              <DetailItem label="Uploaded" value={doc.uploaded} />
              <DetailItem label="File Size" value={doc.size} />
              <DetailItem label="Status" value={statusConfig[doc.status].label} color={
                doc.status === "verified" ? "text-success" : doc.status === "pending" ? "text-warning" : doc.status === "rejected" ? "text-danger" : "text-muted"
              } />
              <DetailItem label="Tier" value={doc.tier.charAt(0).toUpperCase() + doc.tier.slice(1)} />
            </DetailGrid>
          </PanelSection>
          {doc.status === "pending" && (
            <PanelSection title="Review Actions">
              <p className="text-[0.84rem] text-muted mb-3 leading-relaxed">This document is awaiting review. Verify the document meets compliance requirements before approving.</p>
              <div className="flex gap-2">
                <button onClick={() => { showToast(`Document approved: ${doc.name}`); closePanel(); }} className="flex-1 py-2 bg-success/10 border border-success/20 text-success rounded-lg text-[0.82rem] font-semibold hover:bg-success/20 transition-colors">
                  ✓ Approve
                </button>
                <button onClick={() => { showToast(`Document rejected: ${doc.name}`); closePanel(); }} className="flex-1 py-2 bg-danger/10 border border-danger/20 text-danger rounded-lg text-[0.82rem] font-semibold hover:bg-danger/20 transition-colors">
                  ✕ Reject
                </button>
              </div>
            </PanelSection>
          )}
          {doc.status === "rejected" && (
            <PanelSection title="Rejection Note">
              <div className="bg-danger/[0.07] border border-danger/20 rounded-lg px-4 py-3 text-[0.84rem] text-danger">
                Document did not meet required standards. Provider has been notified to re-upload.
              </div>
            </PanelSection>
          )}
        </div>
      ),
      footer: (
        <>
          <Btn onClick={() => showToast(`Downloading ${doc.name}`)}>
            <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </Btn>
          {doc.status !== "pending" && (
            <Btn primary onClick={() => { showToast(`Request sent to ${doc.provider}`); closePanel(); }}>Request Update</Btn>
          )}
        </>
      ),
    });
  };

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        title="Documents"
        subtitle="Compliance documents uploaded by providers"
        actions={
          <Btn primary onClick={() => showToast("Opening document upload")}>
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Upload Document
          </Btn>
        }
      />

      <div className="px-8 py-7 pb-12 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Documents" value={String(DOCUMENTS.length)} change="+7 this week" onClick={() => setStatusFilter("all")} />
          <StatCard label="Pending Review" value={String(DOCUMENTS.filter((d) => d.status === "pending").length)} changeType="neutral" change="Need your attention" onClick={() => setStatusFilter("pending")} />
          <StatCard label="Verified" value={String(DOCUMENTS.filter((d) => d.status === "verified").length)} onClick={() => setStatusFilter("verified")} />
          <StatCard label="Expired / Rejected" value={String(DOCUMENTS.filter((d) => d.status === "expired" || d.status === "rejected").length)} changeType="down" change="Needs re-upload" onClick={() => setStatusFilter("expired")} />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search documents..." />
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "pending", "verified", "rejected", "expired"] as const).map((s) => (
              <FilterPill
                key={s}
                label={s === "all" ? "All" : statusConfig[s as DocStatus]?.label ?? s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                count={s === "all" ? DOCUMENTS.length : DOCUMENTS.filter((d) => d.status === s).length}
              />
            ))}
          </div>
          <select className="ml-auto px-3 py-[7px] border border-border rounded-lg text-[0.78rem] bg-white outline-none focus:border-navy appearance-none cursor-pointer" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {docTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Table */}
        <AdminTable
          headers={[
            { label: "Document", w: "w-[32%]" }, { label: "Provider" }, { label: "Type" },
            { label: "Tier" }, { label: "Uploaded" }, { label: "Size" }, { label: "Status" }, { label: "" },
          ]}
          footer={<span className="text-[0.78rem] text-muted">Showing {filtered.length} of {DOCUMENTS.length} documents</span>}
        >
          {filtered.length === 0 ? (
            <EmptyState message="No documents match your filters." />
          ) : (
            filtered.map((doc) => (
              <tr key={doc.id} onClick={() => openDocPanel(doc)} className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-navy/[0.025] transition-colors group">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center shrink-0 text-navy/50 group-hover:text-navy transition-colors">
                      <FileIcon />
                    </div>
                    <span className="font-medium text-navy text-[0.86rem] group-hover:text-navy-light group-hover:underline transition-colors truncate max-w-[200px]">{doc.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[0.86rem] text-muted">{doc.provider}</td>
                <td className="px-4 py-3.5 text-[0.82rem] text-muted whitespace-nowrap">{doc.docType}</td>
                <td className="px-4 py-3.5"><TierBadge tier={doc.tier} /></td>
                <td className="px-4 py-3.5 text-[0.86rem] text-muted whitespace-nowrap">{doc.uploaded}</td>
                <td className="px-4 py-3.5 text-[0.82rem] text-muted">{doc.size}</td>
                <td className="px-4 py-3.5"><DocStatusPill status={doc.status} /></td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); showToast(`Downloading ${doc.name}`); }} className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-border bg-white text-muted hover:border-navy hover:text-navy transition-all" title="Download">
                      <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    {doc.status === "pending" && (
                      <button onClick={(e) => { e.stopPropagation(); showToast(`Approved: ${doc.name}`); }} className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-success/30 bg-success/10 text-success hover:bg-success/20 transition-all" title="Approve">
                        <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      </div>
    </div>
  );
}

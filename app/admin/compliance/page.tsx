"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import {
  PageHeader, StatCard, StatusPill, TierBadge, Btn,
  PanelSection, PanelRow, DetailGrid, DetailItem,
  SearchBar, FilterPill, AdminTable, EmptyState, ProgressBar,
} from "@/components/admin/admin-ui";

type ItemStatus = "compliant" | "warning" | "overdue";

interface ComplianceItem {
  id: string;
  provider: string;
  tier: "free" | "basic" | "premium";
  itemType: string;
  category: string;
  status: ItemStatus;
  expiry: string;
  daysUntil: number | null;
}

const ITEMS: ComplianceItem[] = [
  { id: "1",  provider: "Palm Academy",               tier: "basic",   itemType: "Staff Credential",   category: "Staff",     status: "overdue",   expiry: "Apr 1, 2026",  daysUntil: -7 },
  { id: "2",  provider: "Bright Horizons Prep",        tier: "premium", itemType: "DCF License",        category: "Licensing", status: "overdue",   expiry: "Apr 2, 2026",  daysUntil: -6 },
  { id: "3",  provider: "Gulf Coast Montessori",       tier: "basic",   itemType: "Staff Credential",   category: "Staff",     status: "overdue",   expiry: "Mar 28, 2026", daysUntil: -10 },
  { id: "4",  provider: "Coral Reef Children's Center",tier: "basic",   itemType: "DCF License",        category: "Licensing", status: "overdue",   expiry: "Mar 15, 2026", daysUntil: -24 },
  { id: "5",  provider: "Palm Academy",               tier: "basic",   itemType: "CPR / First Aid",    category: "Staff",     status: "warning",   expiry: "Apr 14, 2026", daysUntil: 6 },
  { id: "6",  provider: "Pelican Bay Learning",        tier: "free",    itemType: "Staff Credential",   category: "Staff",     status: "warning",   expiry: "Apr 16, 2026", daysUntil: 8 },
  { id: "7",  provider: "First Steps Academy",         tier: "basic",   itemType: "Staff Credential",   category: "Staff",     status: "warning",   expiry: "May 5, 2026",  daysUntil: 27 },
  { id: "8",  provider: "Cedar Ridge Learning",        tier: "basic",   itemType: "Background Screening",category: "Screening",status: "warning",   expiry: "Apr 22, 2026", daysUntil: 14 },
  { id: "9",  provider: "Bright Horizons Prep",        tier: "premium", itemType: "Health Inspection",  category: "Inspection",status: "warning",   expiry: "May 8, 2026",  daysUntil: 30 },
  { id: "10", provider: "Sunshine Early Learning",     tier: "premium", itemType: "Staff Credential",   category: "Staff",     status: "warning",   expiry: "May 12, 2026", daysUntil: 34 },
  { id: "11", provider: "Sunshine Early Learning",     tier: "premium", itemType: "DCF License",        category: "Licensing", status: "compliant", expiry: "May 12, 2026", daysUntil: 34 },
  { id: "12", provider: "Coastal Kids Academy",        tier: "basic",   itemType: "DCF License",        category: "Licensing", status: "compliant", expiry: "Jul 18, 2026", daysUntil: 101 },
  { id: "13", provider: "Starfish Childcare",          tier: "premium", itemType: "DCF License",        category: "Licensing", status: "compliant", expiry: "Nov 8, 2026",  daysUntil: 214 },
  { id: "14", provider: "Heritage Oak Academy",        tier: "basic",   itemType: "Background Screening",category: "Screening",status: "compliant", expiry: "Aug 12, 2026", daysUntil: 126 },
  { id: "15", provider: "Seabreeze Academy",           tier: "premium", itemType: "Staff Credential",   category: "Staff",     status: "compliant", expiry: "Oct 15, 2026", daysUntil: 190 },
];

const CATEGORIES = ["All Categories", "Licensing", "Staff", "Screening", "Inspection"];

const categoryRates = [
  { label: "DCF Licensing",           pct: 96, color: "bg-success" },
  { label: "Staff Credentials",       pct: 84, color: "bg-warning" },
  { label: "Background Screening",    pct: 93, color: "bg-success" },
  { label: "Health & Safety",         pct: 95, color: "bg-success" },
  { label: "Scholarship Eligibility", pct: 88, color: "bg-warning" },
];

export default function CompliancePage() {
  const { showToast, openPanel, closePanel } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ItemStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [view, setView] = useState<"items" | "categories">("items");

  const filtered = ITEMS.filter((item) => {
    const q = search.toLowerCase();
    if (q && !item.provider.toLowerCase().includes(q) && !item.itemType.toLowerCase().includes(q)) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (categoryFilter !== "All Categories" && item.category !== categoryFilter) return false;
    return true;
  });

  const openItemPanel = (item: ComplianceItem) => {
    openPanel({
      title: item.itemType,
      subtitle: item.provider,
      body: (
        <div>
          <PanelSection title="Details">
            <DetailGrid>
              <DetailItem label="Provider" value={item.provider} />
              <DetailItem label="Category" value={item.category} />
              <DetailItem label="Status" value={item.status === "compliant" ? "Compliant" : item.status === "warning" ? "At Risk" : "Overdue"} color={item.status === "compliant" ? "text-success" : item.status === "warning" ? "text-warning" : "text-danger"} />
              <DetailItem label="Expiry" value={item.expiry} color={item.status === "overdue" ? "text-danger" : ""} />
            </DetailGrid>
          </PanelSection>
          <PanelSection title="Action Required">
            {item.status === "overdue" && (
              <div className="bg-danger/[0.07] border border-danger/20 rounded-lg px-4 py-3 text-[0.84rem] text-danger">
                This item is <strong>overdue</strong> by {Math.abs(item.daysUntil ?? 0)} days. Immediate action is required to maintain compliance.
              </div>
            )}
            {item.status === "warning" && (
              <div className="bg-warning/[0.07] border border-warning/20 rounded-lg px-4 py-3 text-[0.84rem] text-warning">
                This item expires in <strong>{item.daysUntil} days</strong>. Send a reminder or request updated documentation.
              </div>
            )}
            {item.status === "compliant" && (
              <div className="bg-success/[0.07] border border-success/20 rounded-lg px-4 py-3 text-[0.84rem] text-success">
                This item is current. Next review due <strong>{item.expiry}</strong>.
              </div>
            )}
          </PanelSection>
        </div>
      ),
      footer: (
        <>
          <Btn onClick={() => { showToast("Document request sent"); closePanel(); }}>Request Doc</Btn>
          <Btn primary onClick={() => { showToast(`Reminder sent to ${item.provider}`); closePanel(); }}>Send Reminder</Btn>
        </>
      ),
    });
  };

  const overdueCount  = ITEMS.filter((i) => i.status === "overdue").length;
  const warningCount  = ITEMS.filter((i) => i.status === "warning").length;
  const compliantCount= ITEMS.filter((i) => i.status === "compliant").length;

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        title="Compliance"
        subtitle="Compliance item tracking across all providers"
        actions={
          <>
            <Btn onClick={() => showToast("Downloading compliance report")}>
              <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Report
            </Btn>
            <Btn primary onClick={() => showToast("Sending bulk reminders to all at-risk providers")}>
              Send All Reminders
            </Btn>
          </>
        }
      />

      <div className="px-8 py-7 pb-12 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Overall Rate" value="91.4%" change="↑ 3.2% from last month" onClick={() => setStatusFilter("all")} />
          <StatCard label="Overdue Items" value={String(overdueCount)} change={`${overdueCount} need immediate action`} changeType="down" onClick={() => setStatusFilter("overdue")} />
          <StatCard label="Expiring (7 days)" value="34" change="12 providers affected" changeType="neutral" onClick={() => setStatusFilter("warning")} />
          <StatCard label="Compliant Items" value={String(compliantCount)} change="Across all providers" onClick={() => setStatusFilter("compliant")} />
        </div>

        {/* Category rates card */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-[1.02rem] font-normal text-navy">Compliance by Category</h3>
            <div className="flex gap-1.5">
              <FilterPill label="By Item" active={view === "items"} onClick={() => setView("items")} />
              <FilterPill label="By Category" active={view === "categories"} onClick={() => setView("categories")} />
            </div>
          </div>
          <div className="space-y-0">
            {categoryRates.map((c) => (
              <div key={c.label} onClick={() => setCategoryFilter(c.label.split(" ")[0] === "DCF" ? "Licensing" : c.label.split(" ")[0] === "Staff" ? "Staff" : c.label.split(" ")[0] === "Background" ? "Screening" : "Inspection")} className="flex items-center gap-4 py-2.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-cream/40 -mx-5 px-5 transition-colors">
                <span className="text-[0.86rem] text-muted w-44 shrink-0">{c.label}</span>
                <ProgressBar pct={c.pct} color={c.color} />
                <span className={`font-bold text-[0.88rem] w-10 text-right ${c.pct >= 90 ? "text-success" : "text-warning"}`}>{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search provider or item..." />
          <div className="flex gap-1.5">
            {(["all", "overdue", "warning", "compliant"] as const).map((s) => (
              <FilterPill
                key={s}
                label={s === "all" ? "All" : s === "compliant" ? "Compliant" : s === "warning" ? "At Risk" : "Overdue"}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                count={s === "all" ? ITEMS.length : ITEMS.filter((i) => i.status === s).length}
              />
            ))}
          </div>
          <select className="ml-auto px-3 py-[7px] border border-border rounded-lg text-[0.78rem] bg-white outline-none focus:border-navy appearance-none cursor-pointer" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <AdminTable
          headers={[
            { label: "Provider", w: "w-[28%]" }, { label: "Item Type" }, { label: "Category" },
            { label: "Tier" }, { label: "Status" }, { label: "Expiry" }, { label: "Days" }, { label: "" },
          ]}
          footer={
            <span className="text-[0.78rem] text-muted">Showing {filtered.length} of {ITEMS.length} items</span>
          }
        >
          {filtered.length === 0 ? (
            <EmptyState message="No compliance items match your filters." />
          ) : (
            filtered.map((item) => (
              <tr key={item.id} onClick={() => openItemPanel(item)} className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-navy/[0.025] transition-colors group">
                <td className="px-4 py-3.5">
                  <span className="font-semibold text-navy text-[0.9rem] group-hover:text-navy-light group-hover:underline transition-colors">{item.provider}</span>
                </td>
                <td className="px-4 py-3.5 text-[0.86rem] text-muted">{item.itemType}</td>
                <td className="px-4 py-3.5 text-[0.86rem] text-muted">{item.category}</td>
                <td className="px-4 py-3.5"><TierBadge tier={item.tier} /></td>
                <td className="px-4 py-3.5"><StatusPill status={item.status} /></td>
                <td className={`px-4 py-3.5 text-[0.86rem] whitespace-nowrap ${item.status === "overdue" ? "font-bold text-danger" : "text-muted"}`}>{item.expiry}</td>
                <td className="px-4 py-3.5">
                  {item.daysUntil !== null && (
                    <span className={`text-[0.82rem] font-semibold ${item.daysUntil < 0 ? "text-danger" : item.daysUntil <= 14 ? "text-warning" : "text-muted"}`}>
                      {item.daysUntil < 0 ? `${Math.abs(item.daysUntil)}d ago` : `${item.daysUntil}d`}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); showToast(`Reminder sent to ${item.provider}`); }} className="px-3 py-1.5 border border-border rounded-lg text-[0.76rem] font-medium bg-white text-muted hover:border-navy hover:text-navy transition-all">Remind</button>
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

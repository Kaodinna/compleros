"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import {
  PageHeader, StatCard, StatusPill, TierBadge, Btn,
  PanelSection, PanelRow, DetailGrid, DetailItem,
  SearchBar, FilterPill, AdminTable, EmptyState,
} from "@/components/admin/admin-ui";

type ProviderStatus = "compliant" | "warning" | "overdue";
type ProviderTier = "free" | "basic" | "premium";

interface Provider {
  id: string;
  name: string;
  type: string;
  tier: ProviderTier;
  county: string;
  status: ProviderStatus;
  joined: string;
  expiry: string;
  email: string;
  license: string;
  items: { label: string; status: ProviderStatus }[];
}

const PROVIDERS: Provider[] = [
  { id: "1",  name: "Sunshine Early Learning",      type: "Childcare Center", tier: "premium", county: "Sarasota",     status: "compliant", joined: "Jan 15, 2026", expiry: "May 12, 2026", email: "admin@sunshine.com",    license: "C12FL-04821", items: [{ label: "DCF License", status: "compliant" }, { label: "Background Screening", status: "compliant" }, { label: "Staff Credentials", status: "warning" }, { label: "Fire Inspection", status: "compliant" }] },
  { id: "2",  name: "Palm Academy",                  type: "Private School",   tier: "basic",   county: "Sarasota",     status: "warning",   joined: "Feb 3, 2026",  expiry: "Apr 14, 2026", email: "info@palmacademy.edu",  license: "PS08FL-01132", items: [{ label: "DCF License", status: "compliant" }, { label: "Staff Credentials", status: "warning" }, { label: "CPR Cert", status: "overdue" }] },
  { id: "3",  name: "Little Explorers",              type: "Microschool",      tier: "free",    county: "Manatee",      status: "compliant", joined: "Mar 1, 2026",  expiry: "Jun 3, 2026",  email: "hello@littleexp.com",  license: "MS03FL-00887", items: [{ label: "DCF License", status: "compliant" }, { label: "Background Screening", status: "compliant" }] },
  { id: "4",  name: "Bright Horizons Prep",          type: "ECE Provider",     tier: "premium", county: "Hillsborough", status: "overdue",   joined: "Nov 22, 2025", expiry: "Apr 2, 2026",  email: "admin@brighthorizons.com", license: "EC11FL-03344", items: [{ label: "DCF License", status: "overdue" }, { label: "Staff Credentials", status: "overdue" }, { label: "Health Inspection", status: "warning" }] },
  { id: "5",  name: "Coastal Kids Academy",          type: "Childcare Center", tier: "basic",   county: "Sarasota",     status: "compliant", joined: "Dec 10, 2025", expiry: "Jul 18, 2026", email: "ops@coastalkids.com",   license: "C12FL-05003", items: [{ label: "DCF License", status: "compliant" }, { label: "Background Screening", status: "compliant" }, { label: "Fire Inspection", status: "compliant" }] },
  { id: "6",  name: "Manatee County Family Center",  type: "ECE Provider",     tier: "free",    county: "Manatee",      status: "compliant", joined: "Apr 7, 2026",  expiry: "Aug 1, 2026",  email: "info@manateefamily.org","license": "EC11FL-05211", items: [{ label: "DCF License", status: "compliant" }, { label: "Background Screening", status: "compliant" }] },
  { id: "7",  name: "Gulf Coast Montessori",         type: "Private School",   tier: "basic",   county: "Charlotte",    status: "overdue",   joined: "Oct 5, 2025",  expiry: "Mar 28, 2026", email: "admin@gulfmontessori.com", license: "PS08FL-00641", items: [{ label: "DCF License", status: "warning" }, { label: "Staff Credentials", status: "overdue" }] },
  { id: "8",  name: "Sunrise Learning Center",       type: "Childcare Center", tier: "premium", county: "Orange",       status: "compliant", joined: "Jan 28, 2026", expiry: "Sep 14, 2026", email: "director@sunriselearning.com", license: "C12FL-04990", items: [{ label: "DCF License", status: "compliant" }, { label: "Background Screening", status: "compliant" }, { label: "Staff Credentials", status: "compliant" }] },
  { id: "9",  name: "First Steps Academy",           type: "ECE Provider",     tier: "basic",   county: "Miami-Dade",   status: "warning",   joined: "Dec 3, 2025",  expiry: "May 5, 2026",  email: "admin@firststeps.edu",  license: "EC11FL-04102", items: [{ label: "DCF License", status: "compliant" }, { label: "Staff Credentials", status: "warning" }, { label: "CPR Cert", status: "warning" }] },
  { id: "10", name: "Rainbow Bridge School",         type: "Private School",   tier: "free",    county: "Broward",      status: "compliant", joined: "Feb 14, 2026", expiry: "Oct 2, 2026",  email: "info@rainbowbridge.edu","license": "PS08FL-01809", items: [{ label: "DCF License", status: "compliant" }, { label: "Background Screening", status: "compliant" }] },
  { id: "11", name: "Magnolia Early Education",      type: "Childcare Center", tier: "basic",   county: "Orange",       status: "compliant", joined: "Nov 30, 2025", expiry: "Jun 20, 2026", email: "admin@magnoliaed.com",  license: "C12FL-04733", items: [{ label: "DCF License", status: "compliant" }, { label: "Fire Inspection", status: "compliant" }] },
  { id: "12", name: "Pelican Bay Learning",          type: "Microschool",      tier: "free",    county: "Collier",      status: "warning",   joined: "Mar 15, 2026", expiry: "Apr 30, 2026", email: "hi@pelicanbaylearning.com", license: "MS03FL-01044", items: [{ label: "DCF License", status: "warning" }, { label: "Staff Credentials", status: "warning" }] },
  { id: "13", name: "Starfish Childcare",            type: "Childcare Center", tier: "premium", county: "Pinellas",     status: "compliant", joined: "Sep 12, 2025", expiry: "Nov 8, 2026",  email: "ops@starfishcare.com",  license: "C12FL-04481", items: [{ label: "DCF License", status: "compliant" }, { label: "Background Screening", status: "compliant" }, { label: "Fire Inspection", status: "compliant" }, { label: "Health Inspection", status: "compliant" }] },
  { id: "14", name: "Heritage Oak Academy",          type: "Private School",   tier: "basic",   county: "Hillsborough", status: "compliant", joined: "Oct 20, 2025", expiry: "Aug 12, 2026", email: "admin@heritageoak.edu",  license: "PS08FL-00998", items: [{ label: "DCF License", status: "compliant" }, { label: "Background Screening", status: "compliant" }] },
  { id: "15", name: "Bayshore Kids Club",            type: "Childcare Center", tier: "free",    county: "Hillsborough", status: "compliant", joined: "Jan 5, 2026",  expiry: "Jul 7, 2026",  email: "hello@bayshorekids.com","license": "C12FL-05088", items: [{ label: "DCF License", status: "compliant" }] },
  { id: "16", name: "Discovery Tree School",         type: "Microschool",      tier: "free",    county: "Miami-Dade",   status: "compliant", joined: "Feb 20, 2026", expiry: "Sep 1, 2026",  email: "info@discoverytree.org","license": "MS03FL-01122", items: [{ label: "DCF License", status: "compliant" }, { label: "Background Screening", status: "compliant" }] },
  { id: "17", name: "Cedar Ridge Learning",          type: "ECE Provider",     tier: "basic",   county: "Broward",      status: "warning",   joined: "Nov 8, 2025",  expiry: "Apr 22, 2026", email: "admin@cedarridge.com",  license: "EC11FL-03876", items: [{ label: "DCF License", status: "compliant" }, { label: "Staff Credentials", status: "warning" }] },
  { id: "18", name: "Seabreeze Academy",             type: "Private School",   tier: "premium", county: "Brevard",      status: "compliant", joined: "Dec 18, 2025", expiry: "Oct 15, 2026", email: "admin@seabreezeacademy.edu", license: "PS08FL-01654", items: [{ label: "DCF License", status: "compliant" }, { label: "Background Screening", status: "compliant" }, { label: "Staff Credentials", status: "compliant" }] },
  { id: "19", name: "Palmetto Learning Village",     type: "ECE Provider",     tier: "free",    county: "Manatee",      status: "compliant", joined: "Mar 25, 2026", expiry: "Nov 3, 2026",  email: "info@palmettovillage.com", license: "EC11FL-05299", items: [{ label: "DCF License", status: "compliant" }] },
  { id: "20", name: "Coral Reef Children's Center",  type: "Childcare Center", tier: "basic",   county: "Miami-Dade",   status: "overdue",   joined: "Oct 14, 2025", expiry: "Mar 15, 2026", email: "admin@coralreefcc.com", license: "C12FL-04315", items: [{ label: "DCF License", status: "overdue" }, { label: "Staff Credentials", status: "overdue" }] },
];

const TYPES = ["Childcare Center", "Private School", "Microschool", "ECE Provider"];
const COUNTIES = ["Sarasota", "Manatee", "Hillsborough", "Miami-Dade", "Broward", "Orange", "Pinellas", "Charlotte", "Collier", "Brevard"];

export default function ProvidersPage() {
  const { showToast, openPanel, closePanel } = useAdmin();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "free" | "basic" | "premium">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "compliant" | "warning" | "overdue">("all");
  const [countyFilter, setCountyFilter] = useState("all");

  const filtered = PROVIDERS.filter((p) => {
    const q = search.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.county.toLowerCase().includes(q)) return false;
    if (tierFilter !== "all" && p.tier !== tierFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (countyFilter !== "all" && p.county !== countyFilter) return false;
    return true;
  });

  const openProviderPanel = (p: Provider) => {
    openPanel({
      title: p.name,
      subtitle: `${p.type} · ${p.county} County`,
      body: (
        <div>
          <PanelSection title="Overview">
            <DetailGrid>
              <DetailItem label="Type" value={p.type} />
              <DetailItem label="Tier" value={p.tier.charAt(0).toUpperCase() + p.tier.slice(1)} />
              <DetailItem label="Status" value={p.status === "compliant" ? "Compliant" : p.status === "warning" ? "At Risk" : "Overdue"} color={p.status === "compliant" ? "text-success" : p.status === "warning" ? "text-warning" : "text-danger"} />
              <DetailItem label="County" value={p.county} />
              <DetailItem label="Joined" value={p.joined} />
              <DetailItem label="License #" value={p.license} />
            </DetailGrid>
          </PanelSection>
          <PanelSection title="Compliance Items">
            {p.items.map((item, i) => (
              <PanelRow key={i} label={item.label} value={<StatusPill status={item.status} />} />
            ))}
          </PanelSection>
          <PanelSection title="Contact">
            <PanelRow label="Email" value={<a href={`mailto:${p.email}`} className="text-navy-light hover:underline text-[0.86rem]">{p.email}</a>} />
            <PanelRow label="Next Expiry" value={<span className={p.status === "overdue" ? "text-danger font-bold" : ""}>{p.expiry}</span>} />
          </PanelSection>
        </div>
      ),
      footer: (
        <>
          <Btn onClick={() => { showToast(`Checklist opened for ${p.name}`); closePanel(); }}>View Checklist</Btn>
          <Btn primary onClick={() => { showToast(`Reminder sent to ${p.name}`); closePanel(); }}>Send Reminder</Btn>
        </>
      ),
    });
  };

  const totalByTier = (t: ProviderTier) => PROVIDERS.filter((p) => p.tier === t).length;

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        title="Providers"
        subtitle="All registered Florida ECE providers"
        actions={
          <>
            <Btn onClick={() => showToast("Exporting provider list as CSV")}>
              <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </Btn>
            <Btn primary onClick={() => showToast("Opening add provider form")}>
              <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add Provider
            </Btn>
          </>
        }
      />

      <div className="px-8 py-7 pb-12 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Providers" value="247" change="↑ 12% this month" onClick={() => setTierFilter("all")} />
          <StatCard label="Free Tier" value={String(totalByTier("free"))} onClick={() => setTierFilter("free")} />
          <StatCard label="Basic" value={String(totalByTier("basic"))} onClick={() => setTierFilter("basic")} />
          <StatCard label="Premium" value={String(totalByTier("premium"))} change="↑ 11% conversion" onClick={() => setTierFilter("premium")} />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search providers..." />
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "free", "basic", "premium"] as const).map((t) => (
              <FilterPill key={t} label={t === "all" ? "All Tiers" : t.charAt(0).toUpperCase() + t.slice(1)} active={tierFilter === t} onClick={() => setTierFilter(t)} count={t === "all" ? PROVIDERS.length : totalByTier(t)} />
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["all", "compliant", "warning", "overdue"] as const).map((s) => (
              <FilterPill key={s} label={s === "all" ? "All Status" : s === "compliant" ? "Compliant" : s === "warning" ? "At Risk" : "Overdue"} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
            ))}
          </div>
          <select className="ml-auto px-3 py-[7px] border border-border rounded-lg text-[0.78rem] bg-white outline-none focus:border-navy appearance-none cursor-pointer" value={countyFilter} onChange={(e) => setCountyFilter(e.target.value)}>
            <option value="all">All Counties</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <AdminTable
          headers={[
            { label: "Provider", w: "w-[28%]" }, { label: "Type" }, { label: "Tier" },
            { label: "County" }, { label: "Status" }, { label: "Joined" }, { label: "Next Expiry" }, { label: "" },
          ]}
          footer={
            <>
              <span className="text-[0.78rem] text-muted">Showing {filtered.length} of {PROVIDERS.length} providers</span>
              <div className="flex gap-1">
                {[1,2,3,"→"].map((p, i) => (
                  <button key={i} onClick={() => showToast(`Page ${p}`)} className={`w-[30px] h-[30px] flex items-center justify-center border rounded-md text-[0.78rem] font-semibold transition-all ${p === 1 ? "bg-navy text-cream border-navy" : "bg-white text-muted border-border hover:border-navy hover:text-navy"}`}>{p}</button>
                ))}
              </div>
            </>
          }
        >
          {filtered.length === 0 ? (
            <EmptyState message="No providers match your filters." />
          ) : (
            filtered.map((p) => (
              <tr key={p.id} onClick={() => openProviderPanel(p)} className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-navy/[0.025] transition-colors group">
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-navy text-[0.9rem] group-hover:text-navy-light group-hover:underline transition-colors">{p.name}</p>
                  <p className="text-[0.74rem] text-muted">{p.email}</p>
                </td>
                <td className="px-4 py-3.5 text-[0.86rem] text-muted">{p.type}</td>
                <td className="px-4 py-3.5"><TierBadge tier={p.tier} /></td>
                <td className="px-4 py-3.5 text-[0.86rem] text-muted">{p.county}</td>
                <td className="px-4 py-3.5"><StatusPill status={p.status} /></td>
                <td className="px-4 py-3.5 text-[0.86rem] text-muted whitespace-nowrap">{p.joined}</td>
                <td className={`px-4 py-3.5 text-[0.86rem] whitespace-nowrap ${p.status === "overdue" ? "font-bold text-danger" : "text-muted"}`}>{p.expiry}</td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openProviderPanel(p); }} className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-border bg-white text-muted hover:border-navy hover:text-navy transition-all" title="View">
                      <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); showToast(`Reminder sent to ${p.name}`); }} className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-border bg-white text-muted hover:border-navy hover:text-navy transition-all" title="Send reminder">
                      <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </button>
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

"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import {
  PageHeader, StatCard, TierBadge, Btn,
  PanelSection, PanelRow, DetailGrid, DetailItem,
  SearchBar, FilterPill, AdminTable, EmptyState,
} from "@/components/admin/admin-ui";

type SubStatus = "active" | "pastdue" | "cancelled";
type Plan = "basic" | "premium";

interface Subscription {
  id: string;
  provider: string;
  county: string;
  plan: Plan;
  amount: number;
  addons: string[];
  since: string;
  nextBilling: string;
  status: SubStatus;
  email: string;
}

const SUBS: Subscription[] = [
  { id: "1",  provider: "Sunshine Early Learning",      county: "Sarasota",     plan: "premium", amount: 120, addons: ["File-for-You"],          since: "Jan 15, 2026", nextBilling: "May 15, 2026",  status: "active",    email: "admin@sunshine.com" },
  { id: "2",  provider: "Palm Academy",                  county: "Sarasota",     plan: "basic",   amount: 40,  addons: [],                        since: "Feb 3, 2026",  nextBilling: "May 3, 2026",   status: "active",    email: "info@palmacademy.edu" },
  { id: "3",  provider: "Bright Horizons Prep",          county: "Hillsborough", plan: "premium", amount: 120, addons: ["File-for-You"],          since: "Nov 22, 2025", nextBilling: "May 22, 2026",  status: "pastdue",   email: "admin@brighthorizons.com" },
  { id: "4",  provider: "Coastal Kids Academy",          county: "Sarasota",     plan: "basic",   amount: 40,  addons: [],                        since: "Dec 10, 2025", nextBilling: "May 10, 2026",  status: "active",    email: "ops@coastalkids.com" },
  { id: "5",  provider: "Gulf Coast Montessori",         county: "Charlotte",    plan: "basic",   amount: 40,  addons: [],                        since: "Oct 5, 2025",  nextBilling: "—",             status: "cancelled", email: "admin@gulfmontessori.com" },
  { id: "6",  provider: "Sunrise Learning Center",       county: "Orange",       plan: "premium", amount: 120, addons: ["File-for-You"],          since: "Jan 28, 2026", nextBilling: "May 28, 2026",  status: "active",    email: "director@sunriselearning.com" },
  { id: "7",  provider: "First Steps Academy",           county: "Miami-Dade",   plan: "basic",   amount: 40,  addons: [],                        since: "Dec 3, 2025",  nextBilling: "May 3, 2026",   status: "active",    email: "admin@firststeps.edu" },
  { id: "8",  provider: "Magnolia Early Education",      county: "Orange",       plan: "basic",   amount: 40,  addons: [],                        since: "Nov 30, 2025", nextBilling: "May 30, 2026",  status: "active",    email: "admin@magnoliaed.com" },
  { id: "9",  provider: "Starfish Childcare",            county: "Pinellas",     plan: "premium", amount: 120, addons: [],                        since: "Sep 12, 2025", nextBilling: "May 12, 2026",  status: "active",    email: "ops@starfishcare.com" },
  { id: "10", provider: "Heritage Oak Academy",          county: "Hillsborough", plan: "basic",   amount: 40,  addons: [],                        since: "Oct 20, 2025", nextBilling: "May 20, 2026",  status: "active",    email: "admin@heritageoak.edu" },
  { id: "11", provider: "Cedar Ridge Learning",          county: "Broward",      plan: "basic",   amount: 40,  addons: [],                        since: "Nov 8, 2025",  nextBilling: "May 8, 2026",   status: "pastdue",   email: "admin@cedarridge.com" },
  { id: "12", provider: "Seabreeze Academy",             county: "Brevard",      plan: "premium", amount: 120, addons: ["File-for-You"],          since: "Dec 18, 2025", nextBilling: "May 18, 2026",  status: "active",    email: "admin@seabreezeacademy.edu" },
  { id: "13", provider: "Coral Reef Children's Center",  county: "Miami-Dade",   plan: "basic",   amount: 40,  addons: [],                        since: "Oct 14, 2025", nextBilling: "—",             status: "cancelled", email: "admin@coralreefcc.com" },
  { id: "14", provider: "Rainbow Bridge School",         county: "Broward",      plan: "basic",   amount: 40,  addons: [],                        since: "Feb 14, 2026", nextBilling: "May 14, 2026",  status: "active",    email: "info@rainbowbridge.edu" },
  { id: "15", provider: "Bayshore Kids Club",            county: "Hillsborough", plan: "basic",   amount: 40,  addons: [],                        since: "Jan 5, 2026",  nextBilling: "May 5, 2026",   status: "active",    email: "hello@bayshorekids.com" },
];

const statusConfig: Record<SubStatus, { bg: string; dot: string; label: string }> = {
  active:    { bg: "bg-success/10 text-success",   dot: "bg-success",   label: "Active" },
  pastdue:   { bg: "bg-danger/10 text-danger",     dot: "bg-danger",    label: "Past Due" },
  cancelled: { bg: "bg-muted/10 text-muted",       dot: "bg-muted",     label: "Cancelled" },
};

function SubStatusPill({ status }: { status: SubStatus }) {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-[10px] py-[3px] rounded-full text-[0.72rem] font-semibold ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export default function SubscriptionsPage() {
  const { showToast, openPanel, closePanel } = useAdmin();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | Plan>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | SubStatus>("all");

  const filtered = SUBS.filter((s) => {
    const q = search.toLowerCase();
    if (q && !s.provider.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
    if (planFilter !== "all" && s.plan !== planFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const activeSubs = SUBS.filter((s) => s.status === "active");
  const basicMRR = activeSubs.filter((s) => s.plan === "basic").reduce((sum, s) => sum + s.amount, 0);
  const premiumMRR = activeSubs.filter((s) => s.plan === "premium").reduce((sum, s) => sum + s.amount, 0);
  const addonMRR = activeSubs.filter((s) => s.addons.length > 0).length * 20;
  const totalMRR = basicMRR + premiumMRR + addonMRR;

  const openSubPanel = (sub: Subscription) => {
    openPanel({
      title: sub.provider,
      subtitle: `${sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)} Plan · ${sub.county} County`,
      body: (
        <div>
          <PanelSection title="Billing Details">
            <DetailGrid>
              <DetailItem label="Plan" value={sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)} />
              <DetailItem label="Amount" value={`$${sub.amount}/mo`} />
              <DetailItem label="Status" value={statusConfig[sub.status].label} color={sub.status === "active" ? "text-success" : sub.status === "pastdue" ? "text-danger" : "text-muted"} />
              <DetailItem label="Subscribed" value={sub.since} />
              <DetailItem label="Next Billing" value={sub.nextBilling} />
              <DetailItem label="Email" value={sub.email} />
            </DetailGrid>
          </PanelSection>
          {sub.addons.length > 0 && (
            <PanelSection title="Add-ons">
              {sub.addons.map((a) => <PanelRow key={a} label={a} value="$20/mo" />)}
            </PanelSection>
          )}
          <PanelSection title="Plan Actions">
            <div className="flex flex-col gap-2">
              <button onClick={() => { showToast(`Upgrading ${sub.provider}`); closePanel(); }} className="w-full py-2 bg-navy/[0.06] border border-navy/20 text-navy rounded-lg text-[0.82rem] font-medium hover:bg-navy/10 transition-colors">
                Upgrade Plan
              </button>
              <button onClick={() => { showToast(`Downgrading ${sub.provider}`); closePanel(); }} className="w-full py-2 bg-cream border border-border text-muted rounded-lg text-[0.82rem] font-medium hover:text-navy hover:border-navy transition-colors">
                Downgrade Plan
              </button>
              {sub.status === "active" && (
                <button onClick={() => { showToast(`Cancellation initiated for ${sub.provider}`); closePanel(); }} className="w-full py-2 bg-danger/[0.06] border border-danger/20 text-danger rounded-lg text-[0.82rem] font-medium hover:bg-danger/10 transition-colors">
                  Cancel Subscription
                </button>
              )}
            </div>
          </PanelSection>
        </div>
      ),
      footer: (
        <Btn primary onClick={() => { showToast("Opening Stripe for " + sub.provider); closePanel(); }}>
          View in Stripe
        </Btn>
      ),
    });
  };

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        title="Subscriptions"
        subtitle="All paying provider accounts"
        actions={
          <>
            <Btn onClick={() => showToast("Opening Stripe dashboard")}>
              <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Open Stripe
            </Btn>
            <Btn onClick={() => showToast("Exporting subscription data")}>Export CSV</Btn>
          </>
        }
      />

      <div className="px-8 py-7 pb-12 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total MRR" value={`$${totalMRR.toLocaleString()}`} change="↑ 18% MoM" onClick={() => setStatusFilter("all")} />
          <StatCard label="ARR Run Rate" value={`$${(totalMRR * 12).toLocaleString()}`} change="Based on current MRR" onClick={() => setStatusFilter("active")} />
          <StatCard label="Paying Subscribers" value={String(activeSubs.length)} change={`${SUBS.filter((s) => s.plan === "premium" && s.status === "active").length} Premium`} onClick={() => setPlanFilter("all")} />
          <StatCard label="Past Due / Churned" value={String(SUBS.filter((s) => s.status !== "active").length)} changeType="down" change="Needs follow-up" onClick={() => setStatusFilter("pastdue")} />
        </div>

        {/* Revenue breakdown */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-heading text-[1.02rem] font-normal text-navy mb-4">Revenue Breakdown — May 2026</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Basic Subscriptions", sub: `${SUBS.filter((s) => s.plan === "basic" && s.status === "active").length} × $40`, value: `$${basicMRR.toLocaleString()}`, pct: Math.round((basicMRR / totalMRR) * 100), color: "bg-navy" },
              { label: "Premium Subscriptions", sub: `${SUBS.filter((s) => s.plan === "premium" && s.status === "active").length} × $120`, value: `$${premiumMRR.toLocaleString()}`, pct: Math.round((premiumMRR / totalMRR) * 100), color: "bg-gold" },
              { label: "File-for-You Add-on", sub: `${activeSubs.filter((s) => s.addons.length > 0).length} × $20`, value: `$${addonMRR}`, pct: Math.round((addonMRR / totalMRR) * 100), color: "bg-success" },
            ].map((r) => (
              <div key={r.label} className="p-4 bg-cream rounded-xl">
                <p className="text-[0.74rem] text-muted uppercase tracking-[0.06em] font-semibold mb-1">{r.label}</p>
                <p className="text-[0.78rem] text-muted mb-2">{r.sub}</p>
                <p className="font-heading text-[1.4rem] text-navy leading-none mb-2">{r.value}</p>
                <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                </div>
                <p className="text-[0.72rem] text-muted mt-1">{r.pct}% of MRR</p>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search provider or email..." />
          <div className="flex gap-1.5">
            {(["all", "basic", "premium"] as const).map((p) => (
              <FilterPill key={p} label={p === "all" ? "All Plans" : p.charAt(0).toUpperCase() + p.slice(1)} active={planFilter === p} onClick={() => setPlanFilter(p)} count={p === "all" ? SUBS.length : SUBS.filter((s) => s.plan === p).length} />
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["all", "active", "pastdue", "cancelled"] as const).map((s) => (
              <FilterPill key={s} label={s === "all" ? "All Status" : statusConfig[s as SubStatus]?.label ?? s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
            ))}
          </div>
        </div>

        {/* Table */}
        <AdminTable
          headers={[
            { label: "Provider", w: "w-[28%]" }, { label: "Plan" }, { label: "Amount/Mo" },
            { label: "Add-ons" }, { label: "Since" }, { label: "Next Billing" }, { label: "Status" }, { label: "" },
          ]}
          footer={<span className="text-[0.78rem] text-muted">Showing {filtered.length} of {SUBS.length} subscriptions</span>}
        >
          {filtered.length === 0 ? (
            <EmptyState message="No subscriptions match your filters." />
          ) : (
            filtered.map((sub) => (
              <tr key={sub.id} onClick={() => openSubPanel(sub)} className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-navy/[0.025] transition-colors group">
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-navy text-[0.9rem] group-hover:text-navy-light group-hover:underline transition-colors">{sub.provider}</p>
                  <p className="text-[0.74rem] text-muted">{sub.email}</p>
                </td>
                <td className="px-4 py-3.5"><TierBadge tier={sub.plan} /></td>
                <td className="px-4 py-3.5 font-semibold text-navy text-[0.86rem]">${sub.amount}</td>
                <td className="px-4 py-3.5 text-[0.82rem] text-muted">{sub.addons.length > 0 ? sub.addons.join(", ") : <span className="text-muted/50">—</span>}</td>
                <td className="px-4 py-3.5 text-[0.86rem] text-muted whitespace-nowrap">{sub.since}</td>
                <td className="px-4 py-3.5 text-[0.86rem] text-muted whitespace-nowrap">{sub.nextBilling}</td>
                <td className="px-4 py-3.5"><SubStatusPill status={sub.status} /></td>
                <td className="px-4 py-3.5">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openSubPanel(sub); }} className="px-3 py-1.5 border border-border rounded-lg text-[0.76rem] font-medium bg-white text-muted hover:border-navy hover:text-navy transition-all">Manage</button>
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

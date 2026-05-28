"use client";

import { useAdmin } from "@/components/admin/admin-context";

// ---- Shared small components ----

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.72rem] uppercase tracking-[0.1em] font-semibold text-muted mb-3">
      {children}
    </p>
  );
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function DetailItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-3 bg-cream rounded-lg">
      <p className="text-[0.7rem] uppercase tracking-[0.06em] text-muted mb-1">{label}</p>
      <p className={`text-[0.92rem] font-semibold ${color ?? "text-navy"}`}>{value}</p>
    </div>
  );
}

function PanelListItem({
  label,
  value,
  onClick,
  valueClass,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  onClick?: () => void;
  valueClass?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between py-[10px] border-b border-border/50 last:border-b-0 text-[0.86rem] ${
        onClick ? "cursor-pointer px-1 -mx-1 rounded-md hover:bg-cream transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <span className="text-muted">{label}</span>
      <span className={valueClass ?? "font-bold text-navy"}>{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: "compliant" | "warning" | "overdue" }) {
  const styles = {
    compliant: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    overdue: "bg-danger/10 text-danger",
  };
  const labels = { compliant: "Compliant", warning: "At Risk", overdue: "Overdue" };
  return (
    <span className={`inline-block px-[10px] py-[3px] rounded-full text-[0.72rem] font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function TierBadge({ tier }: { tier: "free" | "basic" | "premium" }) {
  const styles = {
    free: "bg-muted/10 text-muted",
    basic: "bg-navy/10 text-navy",
    premium: "bg-gold/10 text-gold",
  };
  return (
    <span className={`text-[0.7rem] font-bold px-[9px] py-[2px] rounded uppercase tracking-[0.04em] ${styles[tier]}`}>
      {tier}
    </span>
  );
}

function Btn({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-[18px] py-2 border rounded-lg text-[0.82rem] font-medium transition-all ${
        primary
          ? "bg-navy text-cream border-navy hover:bg-navy-dark"
          : "bg-white text-muted border-border hover:border-navy hover:text-navy"
      }`}
    >
      {children}
    </button>
  );
}

// ---- Panel content builders ----

function ProviderPanelBody({ name, onPanel, onToast }: { name: string; onPanel: (cfg: any) => void; onToast: (m: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Overview</SectionTitle>
        <DetailGrid>
          <DetailItem label="Type" value="Childcare Center" />
          <DetailItem label="Tier" value="Premium" />
          <DetailItem label="Status" value="Compliant" color="text-success" />
          <DetailItem label="Joined" value="Jan 15, 2026" />
          <DetailItem label="County" value="Sarasota" />
          <DetailItem label="License #" value="C12FL-04821" />
        </DetailGrid>
      </div>
      <div>
        <SectionTitle>Compliance Items</SectionTitle>
        <PanelListItem label="DCF License" value={<StatusPill status="compliant" />} />
        <PanelListItem label="Background Screening" value={<StatusPill status="compliant" />} />
        <PanelListItem label="Staff Credentials (3)" value={<StatusPill status="warning" />} />
        <PanelListItem label="Fire Inspection" value={<StatusPill status="compliant" />} />
        <PanelListItem label="Health Inspection" value={<StatusPill status="compliant" />} />
      </div>
      <div>
        <SectionTitle>Scholarship Programs</SectionTitle>
        <PanelListItem label="FTC (VPK)" value={<span className="font-semibold text-success">Active</span>} />
        <PanelListItem label="FES-EO" value={<span className="font-semibold text-success">Active</span>} />
        <PanelListItem label="Step Up for Students" value={<span className="text-muted">Not Enrolled</span>} />
      </div>
    </div>
  );
}

// ---- Main Dashboard ----

const providers = [
  { name: "Sunshine Early Learning", type: "Childcare Center", tier: "premium" as const, status: "compliant" as const, expiry: "May 12, 2026" },
  { name: "Palm Academy", type: "Private School", tier: "basic" as const, status: "warning" as const, expiry: "Apr 14, 2026" },
  { name: "Little Explorers", type: "Microschool", tier: "free" as const, status: "compliant" as const, expiry: "Jun 3, 2026" },
  { name: "Bright Horizons Prep", type: "ECE Provider", tier: "premium" as const, status: "overdue" as const, expiry: "Apr 2, 2026" },
  { name: "Coastal Kids Academy", type: "Childcare Center", tier: "basic" as const, status: "compliant" as const, expiry: "Jul 18, 2026" },
];

const barData = [
  { label: "Nov", value: 142, height: 60, gold: false },
  { label: "Dec", value: 168, height: 78, gold: false },
  { label: "Jan", value: 189, height: 95, gold: false },
  { label: "Feb", value: 211, height: 110, gold: false },
  { label: "Mar", value: 228, height: 135, gold: false },
  { label: "Apr", value: 247, height: 160, gold: true },
];

const monthData: Record<string, { f: number; b: number; p: number; n: number; u: number; c: number }> = {
  "November 2025": { f: 72, b: 48, p: 22, n: 12, u: 4, c: 2 },
  "December 2025": { f: 84, b: 56, p: 28, n: 16, u: 5, c: 1 },
  "January 2026": { f: 96, b: 62, p: 31, n: 18, u: 3, c: 2 },
  "February 2026": { f: 108, b: 70, p: 33, n: 15, u: 7, c: 3 },
  "March 2026": { f: 118, b: 76, p: 34, n: 17, u: 5, c: 2 },
  "April 2026": { f: 128, b: 84, p: 35, n: 19, u: 8, c: 3 },
};

const monthLabels: Record<string, string> = {
  Nov: "November 2025", Dec: "December 2025", Jan: "January 2026",
  Feb: "February 2026", Mar: "March 2026", Apr: "April 2026",
};

export default function AdminDashboard() {
  const { showToast, openPanel } = useAdmin();

  // ---- Panel openers ----

  const openProviderPanel = (name: string) => {
    openPanel({
      title: name,
      subtitle: "Provider Detail",
      body: <ProviderPanelBody name={name} onPanel={openPanel} onToast={showToast} />,
      footer: (
        <>
          <Btn onClick={() => showToast(`Opening checklist for ${name}`)}>View Checklist</Btn>
          <Btn primary onClick={() => showToast(`Reminder sent to ${name}`)}>Send Reminder</Btn>
        </>
      ),
    });
  };

  const openStatProviders = () => {
    openPanel({
      title: "Active Providers",
      subtitle: "247 total — 12% growth this month",
      body: (
        <div className="space-y-6">
          <div>
            <SectionTitle>By Type</SectionTitle>
            <PanelListItem label="Childcare Centers" value="112" />
            <PanelListItem label="Private Schools" value="64" />
            <PanelListItem label="Microschools" value="38" />
            <PanelListItem label="ECE Providers" value="33" />
          </div>
          <div>
            <SectionTitle>Top Counties</SectionTitle>
            <PanelListItem label="Miami-Dade" value="62" />
            <PanelListItem label="Broward" value="41" />
            <PanelListItem label="Hillsborough" value="28" />
            <PanelListItem label="Orange" value="24" />
            <PanelListItem label="Sarasota" value="19" />
          </div>
        </div>
      ),
      footer: <Btn primary onClick={() => showToast("Exporting provider list")}>Export CSV</Btn>,
    });
  };

  const openStatCompliance = () => {
    openPanel({
      title: "Compliance Rate",
      subtitle: "91.4% across all providers",
      body: (
        <div className="space-y-6">
          <div>
            <SectionTitle>By Category</SectionTitle>
            <PanelListItem label="DCF Licensing" value="96%" valueClass="font-bold text-success" />
            <PanelListItem label="Staff Credentials" value="84%" valueClass="font-bold text-warning" />
            <PanelListItem label="Background Screening" value="93%" valueClass="font-bold text-success" />
            <PanelListItem label="Health & Safety" value="95%" valueClass="font-bold text-success" />
            <PanelListItem label="Scholarship Eligibility" value="88%" valueClass="font-bold text-warning" />
          </div>
          <div>
            <SectionTitle>4-Month Trend</SectionTitle>
            <PanelListItem label="January" value="85.1%" />
            <PanelListItem label="February" value="87.6%" />
            <PanelListItem label="March" value="88.2%" />
            <PanelListItem label="April" value="91.4%" valueClass="font-bold text-navy" />
          </div>
        </div>
      ),
      footer: <Btn primary onClick={() => showToast("Generating compliance report")}>Download Report</Btn>,
    });
  };

  const openStatRevenue = () => {
    openPanel({
      title: "Revenue Overview",
      subtitle: "MRR: $8,420 — ARR: $101,040",
      body: (
        <div className="space-y-6">
          <div>
            <SectionTitle>Breakdown</SectionTitle>
            <PanelListItem label="Basic (84 × $40)" value="$3,360" />
            <PanelListItem label="Premium (35 × $120)" value="$4,200" />
            <PanelListItem label="File-for-You Add-on" value="$860" />
          </div>
          <div>
            <SectionTitle>Growth</SectionTitle>
            <PanelListItem label="New MRR" value="+$1,240" valueClass="font-bold text-success" />
            <PanelListItem label="Expansion MRR" value="+$480" valueClass="font-bold text-success" />
            <PanelListItem label="Churned MRR" value="-$360" valueClass="font-bold text-danger" />
            <PanelListItem label="Net New MRR" value="+$1,360" valueClass="font-bold text-navy" />
          </div>
        </div>
      ),
      footer: <Btn primary onClick={() => showToast("Opening Stripe dashboard")}>Open Stripe</Btn>,
    });
  };

  const openStatExpiring = () => {
    openPanel({
      title: "Expiring Items",
      subtitle: "34 items across 12 providers — next 7 days",
      body: (
        <div className="space-y-6">
          <div>
            <SectionTitle>By Type</SectionTitle>
            <PanelListItem label="Staff Credentials" value={<span className="px-[10px] py-[3px] bg-warning/10 text-warning rounded-full text-[0.72rem] font-semibold">14</span>} />
            <PanelListItem label="Background Screening" value={<span className="px-[10px] py-[3px] bg-warning/10 text-warning rounded-full text-[0.72rem] font-semibold">8</span>} />
            <PanelListItem label="CPR / First Aid" value={<span className="px-[10px] py-[3px] bg-warning/10 text-warning rounded-full text-[0.72rem] font-semibold">6</span>} />
            <PanelListItem label="Health Inspections" value={<span className="px-[10px] py-[3px] bg-warning/10 text-warning rounded-full text-[0.72rem] font-semibold">4</span>} />
            <PanelListItem label="Fire Inspections" value={<span className="px-[10px] py-[3px] bg-warning/10 text-warning rounded-full text-[0.72rem] font-semibold">2</span>} />
          </div>
          <div>
            <SectionTitle>Most Affected</SectionTitle>
            <PanelListItem label={<span className="font-semibold text-navy cursor-pointer hover:underline" onClick={() => openProviderPanel("Palm Academy")}>Palm Academy</span>} value="4 items" />
            <PanelListItem label={<span className="font-semibold text-navy cursor-pointer hover:underline" onClick={() => openProviderPanel("Bright Horizons Prep")}>Bright Horizons Prep</span>} value="3 items" />
            <PanelListItem label={<span className="font-semibold text-navy cursor-pointer hover:underline" onClick={() => openProviderPanel("Manatee County Family Center")}>Manatee County Family Center</span>} value="3 items" />
          </div>
        </div>
      ),
      footer: <Btn primary onClick={() => showToast("Bulk reminders sent to 12 providers")}>Send All Reminders</Btn>,
    });
  };

  const openMonthDetail = (label: string) => {
    const key = monthLabels[label];
    const d = monthData[key] ?? monthData["April 2026"];
    openPanel({
      title: key,
      subtitle: "Subscription snapshot",
      body: (
        <div className="space-y-6">
          <div>
            <SectionTitle>Tier Breakdown</SectionTitle>
            <PanelListItem label="Free" value={String(d.f)} />
            <PanelListItem label="Basic" value={String(d.b)} />
            <PanelListItem label="Premium" value={String(d.p)} />
          </div>
          <div>
            <SectionTitle>Movement</SectionTitle>
            <PanelListItem label="New Signups" value={`+${d.n}`} valueClass="font-bold text-success" />
            <PanelListItem label="Upgrades" value={`+${d.u}`} valueClass="font-bold text-success" />
            <PanelListItem label="Churned" value={`-${d.c}`} valueClass="font-bold text-danger" />
          </div>
        </div>
      ),
    });
  };

  const openAlertDetail = (type: "overdue" | "expiring" | "legislative") => {
    if (type === "legislative") {
      openPanel({
        title: "Legislative Update: HB 765",
        subtitle: "Effective July 1, 2026",
        body: (
          <div className="space-y-6">
            <div>
              <SectionTitle>Summary</SectionTitle>
              <p className="text-[0.88rem] text-muted leading-relaxed">
                HB 765 / SB 1690 introduces carve-outs for school-operated programs, effective July 1, 2026. Compliance checklists for affected provider types need updating before this date.
              </p>
            </div>
            <div>
              <SectionTitle>Action Items</SectionTitle>
              <PanelListItem label="Update school-operated program checklists" value={<StatusPill status="warning" />} />
              <PanelListItem label="Notify affected providers" value={<StatusPill status="warning" />} />
              <PanelListItem label="Update resource page content" value={<StatusPill status="warning" />} />
            </div>
          </div>
        ),
        footer: <Btn primary onClick={() => showToast("HB 765 task created")}>Create Task</Btn>,
      });
    } else {
      openPanel({
        title: type === "overdue" ? "Overdue Compliance Items" : "Expiring Items (7 Days)",
        subtitle: "Action required",
        body: (
          <div>
            <SectionTitle>Affected Providers</SectionTitle>
            <PanelListItem
              label={<span className="font-semibold text-navy">Bright Horizons Prep</span>}
              value={<StatusPill status="overdue" />}
              onClick={() => openProviderPanel("Bright Horizons Prep")}
            />
            <PanelListItem
              label={<span className="font-semibold text-navy">Palm Academy</span>}
              value={<StatusPill status="warning" />}
              onClick={() => openProviderPanel("Palm Academy")}
            />
            <PanelListItem
              label={<span className="font-semibold text-navy">Gulf Coast Montessori</span>}
              value={<StatusPill status="overdue" />}
              onClick={() => openProviderPanel("Gulf Coast Montessori")}
            />
          </div>
        ),
        footer: <Btn primary onClick={() => showToast("Reminders sent")}>Send Reminders</Btn>,
      });
    }
  };

  const openAddProvider = () => {
    openPanel({
      title: "Add New Provider",
      subtitle: "Register a provider on the platform",
      body: (
        <div className="space-y-4">
          <SectionTitle>Provider Information</SectionTitle>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Provider Name</label>
            <input
              type="text"
              placeholder="e.g. Sunshine Learning Center"
              className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
              id="new-provider-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Type</label>
              <select className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] bg-white outline-none focus:border-navy">
                <option>Childcare Center</option>
                <option>Private School</option>
                <option>Microschool</option>
                <option>ECE Provider</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">County</label>
              <select className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] bg-white outline-none focus:border-navy">
                <option>Sarasota</option>
                <option>Manatee</option>
                <option>Hillsborough</option>
                <option>Miami-Dade</option>
                <option>Broward</option>
                <option>Orange</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Contact Email</label>
            <input
              type="email"
              placeholder="admin@provider.com"
              className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
            />
          </div>
        </div>
      ),
      footer: (
        <>
          <Btn onClick={() => showToast("Cancelled")}>Cancel</Btn>
          <Btn primary onClick={() => showToast("New provider added successfully")}>Add Provider</Btn>
        </>
      ),
    });
  };

  const openNotifications = () => {
    openPanel({
      title: "Notifications",
      subtitle: "3 unread",
      body: (
        <div className="space-y-1">
          {[
            { dot: "bg-danger", title: "Compliance Alert:", text: "7 providers have overdue items", time: "30 min ago", action: () => openAlertDetail("overdue") },
            { dot: "bg-navy-light", title: "Upgrade:", text: "Sunshine Early Learning → Premium", time: "Yesterday", action: () => openProviderPanel("Sunshine Early Learning") },
            { dot: "bg-gold", title: "System:", text: "HB 765 checklist update — 85 days", time: "2 days ago", action: () => openAlertDetail("legislative") },
          ].map((n, i) => (
            <div key={i} onClick={n.action} className="flex gap-3 py-3.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-cream/50 -mx-7 px-7 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
              <div className="flex-1">
                <p className="text-[0.84rem] text-muted"><strong className="text-navy">{n.title}</strong> {n.text}</p>
                <p className="text-[0.72rem] text-muted/70 mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      ),
      footer: <Btn onClick={() => { showToast("All marked as read"); }}>Mark All Read</Btn>,
    });
  };

  // ---- Render ----

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
        <div>
          <h1 className="font-heading text-[1.3rem] font-normal text-navy">Dashboard</h1>
          <p className="text-[0.76rem] text-muted">Wednesday, May 28, 2026</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-[14px] py-[7px] border border-border rounded-lg bg-white w-[220px] focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/[0.08] transition-all">
            <svg className="w-[14px] h-[14px] text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="border-none outline-none bg-transparent text-[0.82rem] text-navy w-full placeholder:text-muted"
              placeholder="Search providers, docs..."
              onKeyDown={(e) => { if (e.key === "Enter") { showToast("Search: " + (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ""; } }}
            />
          </div>
          {/* Notifications */}
          <button onClick={openNotifications} className="relative w-9 h-9 flex items-center justify-center border border-border rounded-lg bg-white text-muted hover:border-navy hover:text-navy hover:bg-navy/[0.05] transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-[7px] h-[7px] bg-danger border-2 border-white rounded-full" />
          </button>
          {/* Settings */}
          <button onClick={() => showToast("Opening settings")} className="w-9 h-9 flex items-center justify-center border border-border rounded-lg bg-white text-muted hover:border-navy hover:text-navy hover:bg-navy/[0.05] transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
          {/* Add provider */}
          <button
            onClick={openAddProvider}
            className="flex items-center gap-1.5 px-[18px] py-2 bg-navy text-cream text-[0.82rem] font-semibold rounded-lg hover:bg-navy-dark transition-all hover:-translate-y-px hover:shadow-md"
          >
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Add Provider
          </button>
        </div>
      </header>

      <div className="px-8 py-7 pb-12 space-y-6">

        {/* ---- Stats Row ---- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Providers", value: "247", change: "↑ 12% this month", up: true, onClick: openStatProviders },
            { label: "Compliance Rate", value: "91.4%", change: "↑ 3.2% from last month", up: true, onClick: openStatCompliance },
            { label: "Monthly Revenue", value: "$8,420", change: "↑ 18% MoM", up: true, onClick: openStatRevenue },
            { label: "Expiring Items (7d)", value: "34", change: "⚠ 12 providers affected", up: null, onClick: openStatExpiring },
          ].map((stat, i) => (
            <button
              key={i}
              onClick={stat.onClick}
              className="bg-white rounded-xl border border-border p-5 text-left cursor-pointer hover:shadow-md hover:border-navy hover:-translate-y-0.5 active:translate-y-0 transition-all group"
            >
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.07em] text-muted mb-2">{stat.label}</p>
              <p className="font-heading text-[1.85rem] text-navy leading-none">{stat.value}</p>
              <span className={`inline-flex items-center gap-1 text-[0.74rem] font-semibold mt-2 px-[9px] py-[2px] rounded-full ${
                stat.up === true ? "text-success bg-success/10" :
                stat.up === false ? "text-danger bg-danger/10" :
                "text-warning bg-warning/10"
              }`}>
                {stat.change}
              </span>
            </button>
          ))}
        </div>

        {/* ---- Row 2: Chart + Compliance Ring ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Subscription Growth */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-[18px] border-b border-border flex items-center justify-between">
              <h3 className="font-heading text-[1.02rem] font-normal text-navy">Subscription Growth</h3>
              <button onClick={() => showToast("Opening subscription detail")} className="text-[0.78rem] text-navy-light font-medium hover:text-navy transition-colors">
                Details →
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-end gap-2.5 h-[180px] pt-2.5">
                {barData.map((bar) => (
                  <div
                    key={bar.label}
                    className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group relative"
                    onClick={() => openMonthDetail(bar.label)}
                  >
                    {/* Tooltip */}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy-dark text-cream text-[0.72rem] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all after:content-[''] after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:border-l-[5px] after:border-r-[5px] after:border-t-[5px] after:border-l-transparent after:border-r-transparent after:border-t-navy-dark">
                      {bar.label}: {bar.value} users
                    </span>
                    <div
                      className={`w-full max-w-[42px] rounded-t-[5px] rounded-b-[2px] transition-all group-hover:opacity-80 ${bar.gold ? "bg-gold" : "bg-navy"}`}
                      style={{ height: bar.height }}
                    />
                    <span className="text-[0.7rem] text-muted font-medium">{bar.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-5 mt-3.5 text-[0.76rem] text-muted">
                <span><span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-navy mr-1.5 align-middle" />Previous</span>
                <span><span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-gold mr-1.5 align-middle" />Current</span>
              </div>
            </div>
          </div>

          {/* Compliance Ring */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-[18px] border-b border-border flex items-center justify-between">
              <h3 className="font-heading text-[1.02rem] font-normal text-navy">Compliance Overview</h3>
              <button onClick={openStatCompliance} className="text-[0.78rem] text-navy-light font-medium hover:text-navy transition-colors">
                Full Report →
              </button>
            </div>
            <div className="px-5 py-5 flex items-center justify-center gap-7">
              {/* SVG donut */}
              <div className="relative w-[140px] h-[140px] shrink-0 cursor-pointer" onClick={openStatCompliance}>
                <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#E4DFD5" strokeWidth="12" />
                  {/* Compliant: 226/247 = 91.5% → dasharray 364.4 (circ of r=58) */}
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#2E7D52" strokeWidth="12"
                    strokeDasharray="364.4" strokeDashoffset="31" strokeLinecap="round" />
                  {/* At risk: 14/247 */}
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#D4882E" strokeWidth="12"
                    strokeDasharray="364.4" strokeDashoffset="343" strokeLinecap="round"
                    style={{ transform: "rotate(312deg)", transformOrigin: "center" }} />
                  {/* Non-compliant: 7/247 */}
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#C0392B" strokeWidth="12"
                    strokeDasharray="364.4" strokeDashoffset="354" strokeLinecap="round"
                    style={{ transform: "rotate(341deg)", transformOrigin: "center" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-[2rem] text-navy leading-none">91%</span>
                  <span className="text-[0.68rem] text-muted mt-0.5">compliant</span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex flex-col gap-2">
                {[
                  { color: "bg-success", label: "Compliant", count: "226" },
                  { color: "bg-warning", label: "At Risk", count: "14" },
                  { color: "bg-danger", label: "Non-Compliant", count: "7" },
                ].map((l) => (
                  <button
                    key={l.label}
                    onClick={() => showToast(`Filtering: ${l.label}`)}
                    className="flex items-center gap-2 text-[0.82rem] text-muted px-2 py-1 rounded-md hover:bg-cream transition-colors text-left"
                  >
                    <span className={`w-2.5 h-2.5 rounded-[3px] shrink-0 ${l.color}`} />
                    {l.label} ({l.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Row 3: Provider Table + Alerts ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Provider Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-[18px] border-b border-border flex items-center justify-between">
              <h3 className="font-heading text-[1.02rem] font-normal text-navy">Recent Provider Activity</h3>
              <button onClick={() => showToast("Opening all providers")} className="text-[0.78rem] text-navy-light font-medium hover:text-navy transition-colors">
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-cream/30">
                    {["Provider", "Type", "Tier", "Compliance", "Next Expiry"].map((h) => (
                      <th key={h} className="text-left text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted px-4 py-2.5 border-b border-border">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr
                      key={p.name}
                      onClick={() => openProviderPanel(p.name)}
                      className="cursor-pointer hover:bg-navy/[0.025] border-b border-border/50 last:border-0 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-[0.86rem]">
                        <span className="font-semibold text-navy hover:text-navy-light hover:underline transition-colors">
                          {p.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[0.86rem] text-muted">{p.type}</td>
                      <td className="px-4 py-3.5"><TierBadge tier={p.tier} /></td>
                      <td className="px-4 py-3.5"><StatusPill status={p.status} /></td>
                      <td className={`px-4 py-3.5 text-[0.86rem] ${p.status === "overdue" ? "font-bold text-danger" : "text-muted"}`}>
                        {p.expiry}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts + Activity */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-[18px] border-b border-border flex items-center justify-between">
              <h3 className="font-heading text-[1.02rem] font-normal text-navy">Alerts</h3>
              <button onClick={() => showToast("Opening all alerts")} className="text-[0.78rem] text-navy-light font-medium hover:text-navy transition-colors">All →</button>
            </div>
            <div className="p-4 space-y-2">
              {/* Alert rows */}
              {[
                { type: "danger", icon: "circle-info", text: <><strong>7 providers</strong> have overdue compliance items</>, action: () => openAlertDetail("overdue") },
                { type: "warn", icon: "triangle", text: <><strong>34 items</strong> expiring within 7 days</>, action: () => openAlertDetail("expiring") },
                { type: "info", icon: "info", text: <>HB 765 effective <strong>Jul 1, 2026</strong> — update checklists</>, action: () => openAlertDetail("legislative") },
              ].map((a, i) => (
                <div
                  key={i}
                  onClick={a.action}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-[0.84rem] leading-snug cursor-pointer transition-all hover:translate-x-0.5 hover:shadow-sm ${
                    a.type === "danger" ? "bg-danger/[0.08] text-danger" :
                    a.type === "warn" ? "bg-warning/[0.08] text-warning" :
                    "bg-navy/[0.07] text-navy"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  <div>{a.text}</div>
                </div>
              ))}

              {/* Activity feed */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading text-[0.95rem] text-navy">Activity Feed</span>
                  <button onClick={() => showToast("Opening activity feed")} className="text-[0.78rem] text-navy-light font-medium hover:text-navy transition-colors">All →</button>
                </div>
                {[
                  { dot: "bg-success", text: <><strong>Palm Academy</strong> uploaded DCF inspection report</>, time: "2 hours ago", name: "Palm Academy" },
                  { dot: "bg-gold", text: <><strong>New signup:</strong> Manatee County Family Center</>, time: "5 hours ago", name: "Manatee County Family Center" },
                  { dot: "bg-navy-light", text: <><strong>Sunshine Early Learning</strong> upgraded to Premium</>, time: "Yesterday", name: "Sunshine Early Learning" },
                  { dot: "bg-danger", text: <><strong>Bright Horizons Prep</strong> — staff credential expired</>, time: "Yesterday", name: "Bright Horizons Prep" },
                ].map((act, i) => (
                  <div
                    key={i}
                    onClick={() => openProviderPanel(act.name)}
                    className="flex gap-3 py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-cream/50 -mx-4 px-4 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.dot}`} />
                    <div className="flex-1">
                      <p className="text-[0.84rem] text-muted leading-snug">{act.text}</p>
                      <p className="text-[0.72rem] text-muted/70 mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Row 4: Tier + Revenue ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tier Distribution */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-[18px] border-b border-border flex items-center justify-between">
              <h3 className="font-heading text-[1.02rem] font-normal text-navy">Tier Distribution</h3>
              <button onClick={() => showToast("Opening tier breakdown")} className="text-[0.78rem] text-navy-light font-medium hover:text-navy transition-colors">Breakdown →</button>
            </div>
            <div className="px-5 py-4">
              {[
                { label: "Free Tier", count: 128, pct: 52, color: "bg-muted" },
                { label: "Basic", count: 84, pct: 34, color: "bg-navy" },
                { label: "Premium", count: 35, pct: 14, color: "bg-gold" },
              ].map((t) => (
                <div
                  key={t.label}
                  onClick={() => showToast(`Filtering: ${t.label}`)}
                  className="flex items-center gap-3.5 py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-cream/40 -mx-5 px-5 transition-colors"
                >
                  <span className="text-[0.86rem] text-muted flex-1">{t.label}</span>
                  <div className="flex-[2] h-2 bg-cream-dark rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.pct}%` }} />
                  </div>
                  <span className="font-bold text-[0.92rem] text-navy min-w-[46px] text-right">{t.count}</span>
                </div>
              ))}
              <div className="mt-4 pt-3.5 border-t border-border">
                {[
                  { label: "Free → Basic conversion", value: "8.6%", color: "text-navy" },
                  { label: "Basic → Premium conversion", value: "11.2%", color: "text-gold" },
                ].map((c) => (
                  <div key={c.label} className="flex justify-between py-2 text-[0.82rem] cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="text-muted">{c.label}</span>
                    <span className={`font-bold ${c.color}`}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue by Source */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-[18px] border-b border-border flex items-center justify-between">
              <h3 className="font-heading text-[1.02rem] font-normal text-navy">Revenue by Source</h3>
              <span className="text-[0.68rem] px-[10px] py-[3px] rounded-full bg-gold/10 text-gold font-semibold">April 2026</span>
            </div>
            <div className="px-5 py-4">
              {[
                { label: "Basic Subscriptions", value: "$3,360" },
                { label: "Premium Subscriptions", value: "$4,200" },
                { label: "File-for-You Add-on", value: "$860" },
              ].map((r) => (
                <div
                  key={r.label}
                  onClick={() => showToast(`Opening detail: ${r.label}`)}
                  className="flex justify-between items-center py-3 border-b border-border/50 cursor-pointer hover:bg-cream/40 -mx-5 px-5 transition-colors"
                >
                  <span className="text-[0.86rem] text-muted">{r.label}</span>
                  <span className="font-bold text-[0.92rem] text-navy">{r.value}</span>
                </div>
              ))}
              <div className="mt-3.5 pt-3.5 border-t-2 border-border flex justify-between items-baseline">
                <span className="font-semibold text-[0.9rem] text-navy">Total MRR</span>
                <span className="font-heading text-[1.25rem] text-navy">$8,420</span>
              </div>
              <div
                onClick={openStatRevenue}
                className="flex justify-between mt-2 text-[0.8rem] cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="text-muted">ARR Run Rate</span>
                <span className="font-bold text-gold">$101,040</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

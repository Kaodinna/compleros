"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import {
  PageHeader, StatCard, Btn, SeverityBadge,
  PanelSection, DetailGrid, DetailItem,
  SearchBar, FilterPill,
} from "@/components/admin/admin-ui";

type AlertSeverity = "critical" | "warning" | "info";
type AlertStatus = "active" | "resolved" | "dismissed";
type AlertType = "compliance" | "expiry" | "legislative" | "system" | "billing";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  type: AlertType;
  status: AlertStatus;
  providers: string[];
  createdAt: string;
  resolvedAt?: string;
}

const ALERTS: Alert[] = [
  { id: "1",  title: "7 providers with overdue compliance items",    description: "These providers have compliance items past their expiry date and require immediate attention to maintain program eligibility.", severity: "critical", type: "compliance", status: "active",   providers: ["Bright Horizons Prep", "Gulf Coast Montessori", "Coral Reef Children's Center", "Palm Academy"],   createdAt: "Apr 7, 2026",  },
  { id: "2",  title: "34 items expiring within 7 days",              description: "Multiple compliance documents and credentials across 12 providers are set to expire in the next 7 days.",                     severity: "warning",  type: "expiry",     status: "active",   providers: ["Palm Academy", "Bright Horizons Prep", "Manatee County Family Center", "Cedar Ridge Learning"],   createdAt: "Apr 6, 2026",  },
  { id: "3",  title: "HB 765 effective July 1, 2026 — update checklists", description: "House Bill 765 / SB 1690 introduces carve-outs for school-operated programs. Compliance checklists and provider notifications must be updated before the effective date.", severity: "info", type: "legislative", status: "active", providers: [], createdAt: "Apr 1, 2026" },
  { id: "4",  title: "Bright Horizons Prep — DCF License overdue",   description: "The DCF operating license for Bright Horizons Prep expired on April 2, 2026. Provider has been notified.",               severity: "critical", type: "compliance", status: "active",   providers: ["Bright Horizons Prep"],                       createdAt: "Apr 3, 2026",  },
  { id: "5",  title: "3 past-due subscriptions",                     description: "Cedar Ridge Learning, Coral Reef Children's Center, and Gulf Coast Montessori have outstanding balances.",                    severity: "warning",  type: "billing",    status: "active",   providers: ["Cedar Ridge Learning", "Coral Reef Children's Center", "Gulf Coast Montessori"], createdAt: "Apr 5, 2026" },
  { id: "6",  title: "Pelican Bay Learning — Staff credentials expiring", description: "Two staff credentials at Pelican Bay Learning expire in 8 days. Provider reminder sent.",                           severity: "warning",  type: "expiry",     status: "active",   providers: ["Pelican Bay Learning"],                       createdAt: "Apr 4, 2026",  },
  { id: "7",  title: "System maintenance completed",                 description: "Scheduled maintenance window completed. All services are operational.",                                                      severity: "info",     type: "system",     status: "resolved", providers: [],                                             createdAt: "Apr 2, 2026",  resolvedAt: "Apr 2, 2026" },
  { id: "8",  title: "Gulf Coast Montessori — staff credential expired", description: "Staff credential for Gulf Coast Montessori expired March 28, 2026.",                                                 severity: "critical", type: "compliance", status: "resolved", providers: ["Gulf Coast Montessori"],                      createdAt: "Mar 29, 2026", resolvedAt: "Apr 5, 2026" },
  { id: "9",  title: "New legislative update available",             description: "Summary of Q1 2026 Florida ECE legislative changes has been added to the resources section.",                               severity: "info",     type: "legislative", status: "resolved", providers: [],                                            createdAt: "Mar 25, 2026", resolvedAt: "Mar 26, 2026" },
  { id: "10", title: "CPR cert renewals overdue — First Steps Academy", description: "3 staff members at First Steps Academy have overdue CPR/First Aid certifications.",                                  severity: "warning",  type: "compliance", status: "dismissed", providers: ["First Steps Academy"],                        createdAt: "Mar 20, 2026" },
];

const typeLabels: Record<AlertType, string> = {
  compliance: "Compliance", expiry: "Expiry", legislative: "Legislative",
  system: "System", billing: "Billing",
};

const severityIcons: Record<AlertSeverity, React.ReactNode> = {
  critical: (
    <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

const severityBg: Record<AlertSeverity, string> = {
  critical: "bg-danger/[0.06] border-danger/20 text-danger",
  warning:  "bg-warning/[0.06] border-warning/20 text-warning",
  info:     "bg-navy/[0.06] border-navy/20 text-navy",
};

export default function AlertsPage() {
  const { showToast, openPanel, closePanel } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AlertStatus>("active");
  const [severityFilter, setSeverityFilter] = useState<"all" | AlertSeverity>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filtered = ALERTS.filter((a) => {
    const q = search.toLowerCase();
    if (q && !a.title.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    return true;
  });

  const openAlertPanel = (alert: Alert) => {
    openPanel({
      title: alert.title,
      subtitle: `${typeLabels[alert.type]} · ${alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}`,
      body: (
        <div>
          <PanelSection title="Details">
            <p className="text-[0.88rem] text-muted leading-relaxed mb-4">{alert.description}</p>
            <DetailGrid>
              <DetailItem label="Severity" value={alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} color={alert.severity === "critical" ? "text-danger" : alert.severity === "warning" ? "text-warning" : "text-navy"} />
              <DetailItem label="Type" value={typeLabels[alert.type]} />
              <DetailItem label="Created" value={alert.createdAt} />
              <DetailItem label="Status" value={alert.status.charAt(0).toUpperCase() + alert.status.slice(1)} color={alert.status === "active" ? "text-danger" : alert.status === "resolved" ? "text-success" : "text-muted"} />
              {alert.resolvedAt && <DetailItem label="Resolved" value={alert.resolvedAt} />}
            </DetailGrid>
          </PanelSection>
          {alert.providers.length > 0 && (
            <PanelSection title={`Affected Providers (${alert.providers.length})`}>
              {alert.providers.map((p) => (
                <div key={p} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 text-[0.86rem]">
                  <span className="font-semibold text-navy">{p}</span>
                  <button onClick={() => showToast(`Reminder sent to ${p}`)} className="text-[0.76rem] text-navy-light hover:underline">Remind →</button>
                </div>
              ))}
            </PanelSection>
          )}
        </div>
      ),
      footer: alert.status === "active" ? (
        <>
          <Btn onClick={() => { showToast("Alert dismissed"); closePanel(); }}>Dismiss</Btn>
          {alert.providers.length > 0 && (
            <Btn onClick={() => { showToast(`Reminders sent to ${alert.providers.length} providers`); }}>Send All Reminders</Btn>
          )}
          <Btn primary onClick={() => { showToast("Alert marked as resolved"); closePanel(); }}>
            Mark Resolved
          </Btn>
        </>
      ) : (
        <Btn onClick={() => { showToast("Alert reopened"); closePanel(); }}>Reopen Alert</Btn>
      ),
    });
  };

  const activeCount   = ALERTS.filter((a) => a.status === "active").length;
  const criticalCount = ALERTS.filter((a) => a.status === "active" && a.severity === "critical").length;
  const resolvedCount = ALERTS.filter((a) => a.status === "resolved").length;

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        title="Alerts"
        subtitle="Platform alerts, compliance flags, and legislative updates"
        actions={
          <>
            <Btn onClick={() => { showToast("Resolving all non-critical alerts"); }}>Resolve Non-Critical</Btn>
            <Btn primary onClick={() => setShowCreateForm(!showCreateForm)}>
              <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Create Alert
            </Btn>
          </>
        }
      />

      <div className="px-8 py-7 pb-12 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Alerts" value={String(activeCount)} changeType="down" change={`${criticalCount} critical`} onClick={() => setStatusFilter("active")} />
          <StatCard label="Critical" value={String(criticalCount)} changeType="down" change="Needs immediate action" onClick={() => { setStatusFilter("active"); setSeverityFilter("critical"); }} />
          <StatCard label="Resolved (30d)" value={String(resolvedCount)} change="Closed this period" onClick={() => setStatusFilter("resolved")} />
          <StatCard label="Providers Affected" value="12" changeType="neutral" change="Across active alerts" />
        </div>

        {/* Create alert form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <h3 className="font-heading text-[1.02rem] font-normal text-navy">Create New Alert</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Alert Title</label>
                <input className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] outline-none focus:border-navy" placeholder="e.g. New legislative update effective..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Severity</label>
                <select className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] bg-white outline-none focus:border-navy appearance-none cursor-pointer">
                  <option>Info</option><option>Warning</option><option>Critical</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Description</label>
              <textarea rows={3} className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] resize-none outline-none focus:border-navy leading-relaxed" placeholder="Provide context about this alert..." />
            </div>
            <div className="flex gap-2">
              <Btn onClick={() => setShowCreateForm(false)}>Cancel</Btn>
              <Btn primary onClick={() => { showToast("Alert created"); setShowCreateForm(false); }}>Create Alert</Btn>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search alerts..." />
          <div className="flex gap-1.5">
            {(["all", "active", "resolved", "dismissed"] as const).map((s) => (
              <FilterPill key={s} label={s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} active={statusFilter === s} onClick={() => setStatusFilter(s)} count={s === "all" ? ALERTS.length : ALERTS.filter((a) => a.status === s).length} />
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["all", "critical", "warning", "info"] as const).map((s) => (
              <FilterPill key={s} label={s === "all" ? "All Severity" : s.charAt(0).toUpperCase() + s.slice(1)} active={severityFilter === s} onClick={() => setSeverityFilter(s)} />
            ))}
          </div>
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-border p-10 text-center text-muted text-[0.88rem]">
              No alerts match your filters.
            </div>
          )}
          {filtered.map((alert) => (
            <div
              key={alert.id}
              onClick={() => openAlertPanel(alert)}
              className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm hover:translate-x-0.5 ${
                alert.status !== "active" ? "bg-white border-border opacity-70" : `${severityBg[alert.severity]} border`
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={alert.status !== "active" ? "text-muted" : ""}>
                  {severityIcons[alert.severity]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-semibold text-[0.9rem] ${alert.status !== "active" ? "text-muted" : ""}`}>
                        {alert.title}
                      </p>
                      <p className="text-[0.82rem] opacity-75 mt-0.5 leading-snug line-clamp-2">{alert.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <SeverityBadge severity={alert.severity} />
                      <span className="text-[0.72rem] font-semibold px-[10px] py-[3px] rounded-full bg-white/40 border border-current/20">
                        {typeLabels[alert.type]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-[0.76rem] opacity-65">
                      <span>{alert.createdAt}</span>
                      {alert.providers.length > 0 && (
                        <span>{alert.providers.length} provider{alert.providers.length !== 1 ? "s" : ""} affected</span>
                      )}
                      {alert.status !== "active" && (
                        <span className={`font-semibold ${alert.status === "resolved" ? "text-success" : ""}`}>
                          {alert.status === "resolved" ? `Resolved ${alert.resolvedAt}` : "Dismissed"}
                        </span>
                      )}
                    </div>
                    {alert.status === "active" && (
                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {alert.providers.length > 0 && (
                          <button onClick={() => showToast(`Reminders sent to ${alert.providers.length} providers`)} className="px-3 py-1 text-[0.74rem] font-semibold border border-current/25 rounded-md bg-white/30 hover:bg-white/50 transition-colors">
                            Send Reminders
                          </button>
                        )}
                        <button onClick={() => showToast("Alert resolved")} className="px-3 py-1 text-[0.74rem] font-semibold border border-current/25 rounded-md bg-white/30 hover:bg-white/50 transition-colors">
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

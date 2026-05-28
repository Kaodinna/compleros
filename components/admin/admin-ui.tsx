"use client";

import { ReactNode } from "react";

// ---- Buttons ----

export function Btn({
  children, onClick, primary, sm, danger, disabled,
}: {
  children: ReactNode; onClick?: () => void; primary?: boolean; sm?: boolean; danger?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 border rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        sm ? "px-3 py-1.5 text-[0.76rem]" : "px-[18px] py-2 text-[0.82rem]"
      } ${
        primary ? "bg-navy text-cream border-navy hover:bg-navy-dark hover:-translate-y-px hover:shadow-md" :
        danger  ? "border-danger text-danger hover:bg-danger/[0.06]" :
                  "bg-white text-muted border-border hover:border-navy hover:text-navy"
      }`}
    >
      {children}
    </button>
  );
}

// ---- Page header ----

export function PageHeader({
  title, subtitle, actions,
}: {
  title: string; subtitle?: ReactNode; actions?: ReactNode;
}) {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <h1 className="font-heading text-[1.3rem] font-normal text-navy">{title}</h1>
        {subtitle && <div className="text-[0.76rem] text-muted">{subtitle}</div>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}

// ---- Stats bar ----

export function StatCard({
  label, value, change, changeType = "up", onClick,
}: {
  label: string; value: string; change?: string; changeType?: "up" | "down" | "neutral"; onClick?: () => void;
}) {
  const changeColors = { up: "text-success bg-success/10", down: "text-danger bg-danger/10", neutral: "text-warning bg-warning/10" };
  return (
    <button
      onClick={onClick}
      className="bg-white border border-border rounded-xl p-5 text-left hover:shadow-md hover:border-navy hover:-translate-y-0.5 active:translate-y-0 transition-all"
    >
      <p className="text-[0.75rem] font-semibold uppercase tracking-[0.07em] text-muted mb-2">{label}</p>
      <p className="font-heading text-[1.85rem] text-navy leading-none">{value}</p>
      {change && (
        <span className={`inline-flex items-center gap-1 text-[0.74rem] font-semibold mt-2 px-[9px] py-[2px] rounded-full ${changeColors[changeType]}`}>
          {change}
        </span>
      )}
    </button>
  );
}

// ---- Status pills ----

type ComplianceStatus = "compliant" | "warning" | "overdue";
export function StatusPill({ status }: { status: ComplianceStatus }) {
  const cfg = {
    compliant: "bg-success/10 text-success",
    warning:   "bg-warning/10 text-warning",
    overdue:   "bg-danger/10 text-danger",
  };
  const labels = { compliant: "Compliant", warning: "At Risk", overdue: "Overdue" };
  return <span className={`inline-block px-[10px] py-[3px] rounded-full text-[0.72rem] font-semibold ${cfg[status]}`}>{labels[status]}</span>;
}

type Tier = "free" | "basic" | "premium";
export function TierBadge({ tier }: { tier: Tier }) {
  const cfg = { free: "bg-muted/10 text-muted", basic: "bg-navy/10 text-navy", premium: "bg-gold/10 text-gold" };
  return <span className={`text-[0.7rem] font-bold px-[9px] py-[2px] rounded uppercase tracking-[0.04em] ${cfg[tier]}`}>{tier}</span>;
}

// ---- Panel helpers ----

export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[0.72rem] uppercase tracking-[0.1em] font-semibold text-muted mb-3">{title}</p>
      {children}
    </div>
  );
}

export function PanelRow({
  label, value, onClick, valueClass,
}: {
  label: ReactNode; value: ReactNode; onClick?: () => void; valueClass?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between py-[10px] border-b border-border/50 last:border-0 text-[0.86rem] ${
        onClick ? "cursor-pointer px-1 -mx-1 rounded-md hover:bg-cream transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <span className="text-muted">{label}</span>
      <span className={valueClass ?? "font-bold text-navy"}>{value}</span>
    </div>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

export function DetailItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-3 bg-cream rounded-lg">
      <p className="text-[0.7rem] uppercase tracking-[0.06em] text-muted mb-1">{label}</p>
      <p className={`text-[0.92rem] font-semibold ${color ?? "text-navy"}`}>{value}</p>
    </div>
  );
}

// ---- Search ----

export function SearchBar({
  value, onChange, placeholder = "Search...",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-[14px] py-2 border border-border rounded-lg bg-white flex-1 min-w-[200px] max-w-[320px] focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/[0.08] transition-all">
      <svg className="w-[14px] h-[14px] text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <input className="border-none outline-none bg-transparent text-[0.84rem] w-full placeholder:text-muted" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// ---- Filter pill ----

export function FilterPill({
  label, active, onClick, count,
}: {
  label: string; active: boolean; onClick: () => void; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-[14px] py-[6px] border rounded-full text-[0.78rem] font-medium transition-all ${
        active ? "bg-navy text-cream border-navy" : "bg-white text-muted border-border hover:border-navy hover:text-navy"
      }`}
    >
      {label}
      {count !== undefined && <span className="ml-1 opacity-60 text-[0.68rem] font-bold">{count}</span>}
    </button>
  );
}

// ---- Table shell ----

export function AdminTable({
  headers, children, footer,
}: {
  headers: { label: string; w?: string }[];
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-cream/25">
              {headers.map((h, i) => (
                <th key={i} className={`text-left text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted px-4 py-3 border-b border-border ${h.w ?? ""}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {footer && <div className="flex items-center justify-between px-4 py-3.5 border-t border-border">{footer}</div>}
    </div>
  );
}

// ---- Toggle switch ----

export function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-navy" : "bg-border"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

// ---- Empty state ----

export function EmptyState({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={99} className="px-4 py-10 text-center text-muted text-[0.88rem]">{message}</td>
    </tr>
  );
}

// ---- Severity badge for alerts ----

type Severity = "critical" | "warning" | "info";
export function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = {
    critical: "bg-danger/10 text-danger",
    warning:  "bg-warning/10 text-warning",
    info:     "bg-navy/[0.08] text-navy-light",
  };
  const labels = { critical: "Critical", warning: "Warning", info: "Info" };
  return <span className={`inline-block px-[10px] py-[3px] rounded-full text-[0.72rem] font-semibold ${cfg[severity]}`}>{labels[severity]}</span>;
}

// ---- Progress bar ----

export function ProgressBar({ pct, color = "bg-navy" }: { pct: number; color?: string }) {
  return (
    <div className="flex-[2] h-2 bg-cream-dark rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

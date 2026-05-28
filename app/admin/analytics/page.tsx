"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { PageHeader, StatCard, ProgressBar } from "@/components/admin/admin-ui";

// ---- Charts ----

function BarChart({
  data, height = 180, onBarClick,
}: {
  data: { label: string; value: number; gold?: boolean }[];
  height?: number;
  onBarClick?: (label: string, value: number) => void;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((bar) => (
        <div
          key={bar.label}
          className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group relative"
          onClick={() => onBarClick?.(bar.label, bar.value)}
        >
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-navy-dark text-cream text-[0.72rem] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all">
            {bar.label}: {bar.value.toLocaleString()}
          </span>
          <div
            className={`w-full max-w-[42px] rounded-t-[5px] rounded-b-[2px] transition-all group-hover:opacity-75 ${bar.gold ? "bg-gold" : "bg-navy"}`}
            style={{ height: Math.round((bar.value / max) * (height - 24)) }}
          />
          <span className="text-[0.7rem] text-muted font-medium">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({
  data, color = "#1B4D6B", height = 120,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100 / (data.length - 1);
  const pts = data.map((v, i) => `${i * w},${height - ((v - min) / range) * (height - 10) - 5}`).join(" ");
  const area = `0,${height} ${pts} ${(data.length - 1) * w},${height}`;

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <polyline points={area} fill={color} fillOpacity="0.08" stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {data.map((v, i) => (
        <circle key={i} cx={i * w} cy={height - ((v - min) / range) * (height - 10) - 5} r="2" fill={color} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

// ---- Data ----

const providerGrowth = [
  { label: "Nov", value: 142 }, { label: "Dec", value: 168 }, { label: "Jan", value: 189 },
  { label: "Feb", value: 211 }, { label: "Mar", value: 228 }, { label: "Apr", value: 247, gold: true },
];
const revenueData  = [3100, 4200, 5400, 6600, 7120, 8420];
const complianceData = [85.1, 87.6, 88.2, 89.0, 90.1, 91.4];
const signupData   = [18, 22, 26, 24, 28, 31];

const countyData = [
  { county: "Miami-Dade",  providers: 62, pct: 25, color: "bg-navy" },
  { county: "Broward",     providers: 41, pct: 17, color: "bg-navy-light" },
  { county: "Hillsborough",providers: 28, pct: 11, color: "bg-gold" },
  { county: "Orange",      providers: 24, pct: 10, color: "bg-success" },
  { county: "Sarasota",    providers: 19, pct: 8,  color: "bg-warning" },
  { county: "Manatee",     providers: 16, pct: 6,  color: "bg-muted" },
  { county: "Pinellas",    providers: 14, pct: 6,  color: "bg-navy" },
  { county: "Other",       providers: 43, pct: 17, color: "bg-cream-dark" },
];

const tierHistory = [
  { month: "Nov", free: 72, basic: 48, premium: 22 },
  { month: "Dec", free: 84, basic: 56, premium: 28 },
  { month: "Jan", free: 96, basic: 62, premium: 31 },
  { month: "Feb", free: 108, basic: 70, premium: 33 },
  { month: "Mar", free: 118, basic: 76, premium: 34 },
  { month: "Apr", free: 128, basic: 84, premium: 35 },
];

const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

export default function AnalyticsPage() {
  const { showToast } = useAdmin();
  const [range, setRange] = useState("6M");

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        title="Analytics"
        subtitle="Platform growth, revenue, and compliance trends"
        actions={
          <div className="flex gap-1.5">
            {["1M", "3M", "6M", "YTD"].map((r) => (
              <button
                key={r}
                onClick={() => { setRange(r); showToast(`Showing ${r} data`); }}
                className={`px-3 py-1.5 border rounded-lg text-[0.78rem] font-medium transition-all ${range === r ? "bg-navy text-cream border-navy" : "bg-white text-muted border-border hover:border-navy hover:text-navy"}`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      <div className="px-8 py-7 pb-12 space-y-5">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Providers" value="247" change="↑ 74% from Nov" />
          <StatCard label="MRR" value="$8,420" change="↑ 172% from Nov" />
          <StatCard label="Compliance Rate" value="91.4%" change="↑ 6.3pp from Nov" />
          <StatCard label="Monthly Signups" value="31" change="↑ 72% from Nov" />
        </div>

        {/* Growth + Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-heading text-[1.02rem] font-normal text-navy">Provider Growth</h3>
                <p className="text-[0.74rem] text-muted mt-0.5">Total registered providers by month</p>
              </div>
              <span className="text-[0.74rem] font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">↑ 74%</span>
            </div>
            <BarChart data={providerGrowth} onBarClick={(l, v) => showToast(`${l}: ${v} providers`)} />
            <div className="flex gap-5 mt-3.5 text-[0.76rem] text-muted">
              <span><span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-navy mr-1.5 align-middle" />Previous months</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-gold mr-1.5 align-middle" />Current month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-heading text-[1.02rem] font-normal text-navy">Monthly Revenue (MRR)</h3>
                <p className="text-[0.74rem] text-muted mt-0.5">Subscription revenue per month</p>
              </div>
              <span className="text-[0.74rem] font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">↑ 172%</span>
            </div>
            <div className="mb-2">
              <LineChart data={revenueData} color="#1B4D6B" height={130} />
            </div>
            <div className="flex justify-between text-[0.7rem] text-muted px-1">
              {months.map((m) => <span key={m}>{m}</span>)}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
              {[
                { label: "Start MRR", value: "$3,100" },
                { label: "Current MRR", value: "$8,420" },
                { label: "Growth", value: "+$5,320" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-[0.7rem] text-muted uppercase tracking-[0.06em] mb-0.5">{s.label}</p>
                  <p className="font-semibold text-navy text-[0.92rem]">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance + Signups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-heading text-[1.02rem] font-normal text-navy">Compliance Rate Trend</h3>
                <p className="text-[0.74rem] text-muted mt-0.5">Overall compliance rate over time</p>
              </div>
              <span className="text-[0.74rem] font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">↑ 6.3pp</span>
            </div>
            <LineChart data={complianceData} color="#2E7D52" height={130} />
            <div className="flex justify-between text-[0.7rem] text-muted px-1 mt-2">
              {months.map((m) => <span key={m}>{m}</span>)}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
              {[
                { label: "Lowest", value: "85.1%" },
                { label: "Current", value: "91.4%" },
                { label: "Target", value: "95.0%" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-[0.7rem] text-muted uppercase tracking-[0.06em] mb-0.5">{s.label}</p>
                  <p className="font-semibold text-navy text-[0.92rem]">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-heading text-[1.02rem] font-normal text-navy">New Signups / Month</h3>
                <p className="text-[0.74rem] text-muted mt-0.5">New provider registrations per month</p>
              </div>
            </div>
            <BarChart data={signupData.map((v, i) => ({ label: months[i], value: v }))} height={130} onBarClick={(l, v) => showToast(`${l}: ${v} new signups`)} />
          </div>
        </div>

        {/* Tier breakdown + Geographic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tier history */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-heading text-[1.02rem] font-normal text-navy mb-4">Tier Distribution Over Time</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[0.82rem]">
                <thead>
                  <tr className="border-b border-border">
                    {["Month", "Free", "Basic", "Premium", "Total"].map((h) => (
                      <th key={h} className="text-left text-[0.7rem] uppercase tracking-[0.07em] font-semibold text-muted py-2 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tierHistory.map((row, i) => (
                    <tr key={row.month} className={`border-b border-border/50 last:border-0 ${i === tierHistory.length - 1 ? "font-semibold" : ""}`}>
                      <td className="py-2.5 pr-4 text-muted">{row.month}</td>
                      <td className="py-2.5 pr-4 text-muted">{row.free}</td>
                      <td className="py-2.5 pr-4 text-navy">{row.basic}</td>
                      <td className="py-2.5 pr-4 text-gold">{row.premium}</td>
                      <td className="py-2.5 text-navy font-semibold">{row.free + row.basic + row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
              <div className="bg-cream rounded-lg p-3">
                <p className="text-[0.7rem] text-muted uppercase tracking-[0.06em] mb-1">Free → Basic Conversion</p>
                <p className="font-semibold text-navy text-[1.1rem]">8.6%</p>
              </div>
              <div className="bg-cream rounded-lg p-3">
                <p className="text-[0.7rem] text-muted uppercase tracking-[0.06em] mb-1">Basic → Premium Conversion</p>
                <p className="font-semibold text-gold text-[1.1rem]">11.2%</p>
              </div>
            </div>
          </div>

          {/* Geographic distribution */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-heading text-[1.02rem] font-normal text-navy mb-4">Providers by County</h3>
            <div className="space-y-0">
              {countyData.map((c) => (
                <div key={c.county} onClick={() => showToast(`${c.county}: ${c.providers} providers`)} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0 cursor-pointer hover:bg-cream/40 -mx-5 px-5 transition-colors">
                  <span className="text-[0.86rem] text-muted w-28 shrink-0">{c.county}</span>
                  <ProgressBar pct={c.pct} color={c.color} />
                  <span className="font-bold text-navy text-[0.88rem] w-8 text-right shrink-0">{c.providers}</span>
                  <span className="text-[0.74rem] text-muted w-8 text-right shrink-0">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key metrics summary */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-heading text-[1.02rem] font-normal text-navy mb-4">Key Performance Metrics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Avg Revenue / Provider",    value: "$34.09",  sub: "MRR ÷ paying subscribers",  color: "text-navy" },
              { label: "Net MRR Growth (Apr)",       value: "+$1,360", sub: "New + expansion − churn",    color: "text-success" },
              { label: "Churn Rate",                  value: "2.4%",   sub: "1 cancelled this month",     color: "text-danger" },
              { label: "Avg Items / Provider",        value: "2.8",    sub: "Compliance items tracked",   color: "text-navy" },
              { label: "Platform NPS",               value: "72",     sub: "Based on provider surveys",  color: "text-success" },
              { label: "Time to Compliance",          value: "4.2 days",sub: "Avg onboarding → compliant",color: "text-navy" },
              { label: "Support Tickets / Month",    value: "14",     sub: "Avg resolution: 6.2 hrs",    color: "text-navy" },
              { label: "Resource Page Views (30d)",  value: "2,840",  sub: "↑ 24% vs prior month",       color: "text-navy" },
            ].map((m) => (
              <div key={m.label} className="p-4 bg-cream rounded-xl">
                <p className="text-[0.7rem] text-muted uppercase tracking-[0.06em] mb-1 font-semibold leading-tight">{m.label}</p>
                <p className={`font-heading text-[1.4rem] leading-none ${m.color}`}>{m.value}</p>
                <p className="text-[0.72rem] text-muted mt-1">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

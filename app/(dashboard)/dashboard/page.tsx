import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/dashboard/Header";
import Link from "next/link";

function daysUntil(dateStr: string) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - now.getTime()) / 86400000);
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: licenses },
    { data: staffList },
    { data: completions },
    { data: checklistItems },
    { data: activityLogs },
    { data: profile },
    { data: documents },
    { data: updates },
  ] = await Promise.all([
    supabase.from("licenses").select("*").eq("user_id", user.id).order("expires_at"),
    supabase.from("staff").select("id").eq("user_id", user.id),
    supabase.from("checklist_completions").select("is_completed").eq("user_id", user.id),
    supabase.from("checklist_items").select("id"),
    supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("full_name, plan_type").eq("id", user.id).single(),
    supabase.from("documents").select("size_bytes").eq("user_id", user.id),
    supabase.from("regulatory_updates").select("id").order("published_date", { ascending: false }),
  ]);

  const totalItems = checklistItems?.length ?? 0;
  const completedItems = completions?.filter(c => c.is_completed).length ?? 0;
  const complianceScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const staffCount = staffList?.length ?? 0;
  const licenseCount = licenses?.length ?? 0;
  const totalBytes = (documents ?? []).reduce((s, d) => s + (d.size_bytes ?? 0), 0);
  const storageMB = (totalBytes / (1024 * 1024)).toFixed(1);
  const updateCount = updates?.length ?? 0;
  const displayName = profile?.full_name ?? user.email?.split("@")[0] ?? "User";
  const programName = displayName; // Will show program name from settings ideally

  // License breakdown
  const lics = licenses ?? [];
  const activeCount = lics.filter(l => daysUntil(l.expires_at) > 60).length;
  const expiringCount = lics.filter(l => { const d = daysUntil(l.expires_at); return d >= 0 && d <= 60; }).length;
  const expiredCount = lics.filter(l => daysUntil(l.expires_at) < 0).length;

  // Next deadline
  const nextDeadline = lics.find(l => daysUntil(l.expires_at) >= 0);
  const nextDays = nextDeadline ? daysUntil(nextDeadline.expires_at) : null;

  // Compliance score ring values
  const r = 42, circ = 2 * Math.PI * r;
  const dashOffset = circ - (complianceScore / 100) * circ;

  return (
    <>
      <Header title="Compliance Health Dashboard" />
      <div className="p-[24px_28px] space-y-5">

        {/* Health Score Bar */}
        <div className="flex items-center gap-[22px] bg-white border border-[#E2DFD8] rounded-[14px] px-[26px] py-[22px]">
          {/* Ring */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg width="96" height="96" className="absolute top-0 left-0" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="48" cy="48" r={r} fill="none" stroke="#E2DFD8" strokeWidth="7" />
              <circle cx="48" cy="48" r={r} fill="none" stroke="#C4985A" strokeWidth="7"
                strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round" />
            </svg>
            <span className="relative z-10 font-heading text-[26px] font-bold text-[#A87D42]">{complianceScore}%</span>
          </div>
          {/* Info */}
          <div className="flex-1">
            <h2 className="font-heading text-[20px] font-semibold text-navy">Compliance Health Score</h2>
            <p className="text-[12px] text-muted mt-1">
              {programName} · Based on {licenseCount} license{licenseCount !== 1 ? "s" : ""} + {completedItems} checklist items tracked
            </p>
            <div className="flex gap-3.5 mt-2.5">
              {[
                { dot: "#2E7D52", label: `${activeCount} Active` },
                { dot: "#C4985A", label: `${expiringCount} Expiring` },
                { dot: "#C0392B", label: `${expiredCount} Expired` },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-muted">
                  <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: item.dot }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          <Link href="/pricing" className="shrink-0 border border-[#E2DFD8] rounded-[9px] px-[18px] py-2 text-[12px] font-semibold text-[#2D2D2D] hover:border-navy hover:text-navy transition-colors whitespace-nowrap">
            Improve Score
          </Link>
        </div>

        {/* Upgrade Banner */}
        <div className="bg-[#FFFBF0] border border-[#F5E6C8] rounded-[11px] px-[18px] py-3.5 flex items-center gap-2.5">
          <span className="text-[16px]">⭐</span>
          <div className="flex-1">
            <div className="text-[12px] font-semibold text-[#A87D42]">Automated alerts available on Basic</div>
            <div className="text-[11px] text-muted">Get notified before deadlines, credential expirations, and regulatory changes.</div>
          </div>
          <Link href="/pricing" className="shrink-0 bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">
            See Plans
          </Link>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { value: `${staffCount}/5`, label: "Staff Profiles" },
            { value: `${storageMB} MB`, label: "of 250 MB Used" },
            { value: "5", label: "Templates Available" },
            { value: String(updateCount), label: "Unread Updates" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E2DFD8] rounded-[10px] p-4 text-center">
              <div className="font-heading text-[24px] font-bold text-navy">{s.value}</div>
              <div className="text-[10px] text-muted uppercase tracking-[0.5px] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 2-col: Deadline + Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Upcoming Deadline */}
          <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-[22px]">
            <div className="font-heading text-[16px] font-semibold text-navy mb-3">Upcoming Deadline</div>
            {nextDeadline ? (
              <div className="flex justify-between items-center py-2">
                <div>
                  <div className="font-medium text-[13px] text-[#2D2D2D]">{nextDeadline.license_type}</div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {new Date(nextDeadline.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  nextDays! <= 60 ? "bg-[#FFFBF0] text-[#A87D42]" : "bg-[#ECFDF5] text-[#2E7D52]"
                }`}>
                  {nextDays} days
                </span>
              </div>
            ) : (
              <div className="py-4 text-center text-[13px] text-muted">
                <Link href="/licenses" className="text-navy font-semibold hover:text-gold transition-colors">+ Add your first license</Link>
              </div>
            )}
            <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[14px] py-2.5 flex items-center gap-3 mt-3">
              <span className="text-[16px]">🔒</span>
              <p className="text-[11px] text-muted flex-1">Track all deadlines with alerts on Basic</p>
            </div>
          </div>

          {/* Compliance by Category */}
          <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-[22px]">
            <div className="font-heading text-[16px] font-semibold text-navy mb-3">Compliance by Category</div>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-[#2D2D2D]">Licenses & Permits</span>
                  <span className="font-semibold text-[#2E7D52]">{licenseCount > 0 ? "100%" : "0%"}</span>
                </div>
                <div className="h-[5px] bg-cream rounded-full overflow-hidden">
                  <div className="h-full bg-[#2E7D52] rounded-full" style={{ width: licenseCount > 0 ? "100%" : "0%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-[#2D2D2D]">Inspection Checklist</span>
                  <span className="font-semibold text-[#2E7D52]">{complianceScore}%</span>
                </div>
                <div className="h-[5px] bg-cream rounded-full overflow-hidden">
                  <div className="h-full bg-[#2E7D52] rounded-full" style={{ width: `${complianceScore}%` }} />
                </div>
              </div>
              <div className="opacity-40">
                <div className="flex justify-between text-[12px] mb-1">
                  <span>Staff Credentials</span>
                  <span className="font-semibold text-muted">🔒</span>
                </div>
                <div className="h-[5px] bg-cream rounded-full" />
              </div>
              <div className="opacity-40">
                <div className="flex justify-between text-[12px] mb-1">
                  <span>Facility Safety</span>
                  <span className="font-semibold text-muted">🔒</span>
                </div>
                <div className="h-[5px] bg-cream rounded-full" />
              </div>
            </div>
            <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[14px] py-2.5 flex items-center gap-3 mt-3">
              <span className="text-[16px]">🔒</span>
              <p className="text-[11px] text-muted flex-1">Full category tracking on Basic</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-[22px]">
          <div className="font-heading text-[16px] font-semibold text-navy mb-3">Recent Activity</div>
          {(activityLogs ?? []).length === 0 ? (
            <p className="text-[13px] text-muted py-4 text-center">No activity yet. Complete checklist items or add a license to get started.</p>
          ) : (
            <div className="divide-y divide-[#E2DFD8]">
              {(activityLogs ?? []).map(log => (
                <div key={log.id} className="flex items-center gap-2.5 py-2 text-[12px]">
                  <div className="w-7 h-7 rounded-[7px] bg-cream flex items-center justify-center text-[13px] shrink-0">
                    {log.icon}
                  </div>
                  <div className="flex-1 text-[#2D2D2D]">{log.description}</div>
                  <div className="text-muted text-[11px] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Upgrade Banner */}
        <div className="bg-gradient-to-r from-cream to-[#E8E2D6] border border-[#E2DFD8] rounded-[11px] px-6 py-5 flex items-center gap-4">
          <p className="flex-1 text-[13px] text-[#2D2D2D]">
            You're on the <strong>Free plan</strong>. Unlock credential tracking, automated alerts, document expiry tracking, and inspection readiness tools.
          </p>
          <Link href="/pricing" className="shrink-0 bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">
            Compare Plans
          </Link>
        </div>
      </div>
    </>
  );
}

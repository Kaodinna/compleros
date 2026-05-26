import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Header from "@/components/dashboard/Header";
import Link from "next/link";
import SeePlansButton from "@/components/dashboard/SeePlansButton";

function daysUntil(dateStr: string) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - now.getTime()) / 86400000);
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function dismissBanner() {
  "use server";
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ upgrade_banner_dismissed: new Date().toISOString() }).eq("id", user.id);
  revalidatePath("/dashboard");
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
    { data: program },
  ] = await Promise.all([
    supabase.from("licenses").select("*").eq("user_id", user.id).order("expires_at"),
    supabase.from("staff").select("id").eq("user_id", user.id),
    supabase.from("checklist_completions").select("is_completed").eq("user_id", user.id),
    supabase.from("checklist_items").select("id"),
    supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("full_name, plan_type, upgrade_banner_dismissed").eq("id", user.id).single(),
    supabase.from("documents").select("size_bytes").eq("user_id", user.id),
    supabase.from("regulatory_updates").select("id").order("published_date", { ascending: false }),
    supabase.from("programs").select("name").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  const totalItems = checklistItems?.length ?? 0;
  const completedItems = completions?.filter(c => c.is_completed).length ?? 0;
  const complianceScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const staffCount = staffList?.length ?? 0;
  const licenseCount = licenses?.length ?? 0;
  const totalBytes = (documents ?? []).reduce((s, d) => s + (d.size_bytes ?? 0), 0);
  const storageMB = (totalBytes / (1024 * 1024)).toFixed(1);
  const updateCount = updates?.length ?? 0;

  const fullName = profile?.full_name ?? "";
  const firstName = fullName.split(" ")[0] || user.email?.split("@")[0] || "there";
  const programName = program?.name ?? "";

  const lics = licenses ?? [];
  const activeCount = lics.filter(l => daysUntil(l.expires_at) > 60).length;
  const expiringCount = lics.filter(l => { const d = daysUntil(l.expires_at); return d >= 0 && d <= 60; }).length;
  const expiredCount = lics.filter(l => daysUntil(l.expires_at) < 0).length;
  const attentionCount = lics.filter(l => daysUntil(l.expires_at) <= 30).length;

  const primaryLicense = lics[0] ?? null;
  const upcomingDeadlines = lics.filter(l => daysUntil(l.expires_at) >= -30).slice(0, 3);

  const r = 42, circ = 2 * Math.PI * r;
  const dashOffset = circ - (complianceScore / 100) * circ;
  const scoreColor = complianceScore >= 90 ? "#2E7D52" : complianceScore >= 70 ? "#C4985A" : "#C0392B";

  const dismissed = profile?.upgrade_banner_dismissed;
  const showBanner = !dismissed || (Date.now() - new Date(dismissed as string).getTime() > 14 * 86400000);

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-4 sm:p-[24px_28px] space-y-5">

        {/* Section A — Welcome Header */}
        <div>
          <h1 className="font-heading text-[22px] font-bold text-navy">Welcome back, {firstName}</h1>
          <p className="text-[12px] text-muted mt-0.5">
            {todayStr}{programName ? ` · ${programName}` : ""}
          </p>
        </div>

        {/* Section B — Compliance Score Card */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-[22px] bg-white border border-[#E2DFD8] rounded-[14px] px-5 sm:px-[26px] py-5 sm:py-[22px]">
          <div className="relative w-24 h-24 shrink-0 self-center sm:self-auto flex items-center justify-center">
            <svg width="96" height="96" className="absolute top-0 left-0" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="48" cy="48" r={r} fill="none" stroke="#E2DFD8" strokeWidth="7" />
              <circle cx="48" cy="48" r={r} fill="none" stroke={scoreColor} strokeWidth="7"
                strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round" />
            </svg>
            <span className="relative z-10 font-heading text-[26px] font-bold" style={{ color: scoreColor }}>{complianceScore}%</span>
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-[18px] sm:text-[20px] font-semibold text-navy">Compliance Health Score</h2>
            <p className="text-[12px] text-muted mt-1">
              Based on {licenseCount} license{licenseCount !== 1 ? "s" : ""} + {completedItems} checklist items tracked
              {attentionCount > 0 && (
                <span className="text-[#C0392B] font-semibold"> · {attentionCount} item{attentionCount !== 1 ? "s" : ""} need attention</span>
              )}
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
            <SeePlansButton className="sm:hidden mt-3 border border-[#E2DFD8] rounded-[9px] px-4 py-1.5 text-[12px] font-semibold text-[#2D2D2D] hover:border-navy hover:text-navy transition-colors">
              Improve Score
            </SeePlansButton>
          </div>
          <SeePlansButton className="hidden sm:block shrink-0 border border-[#E2DFD8] rounded-[9px] px-[18px] py-2 text-[12px] font-semibold text-[#2D2D2D] hover:border-navy hover:text-navy transition-colors whitespace-nowrap">
            Improve Score
          </SeePlansButton>
        </div>

        {/* Quick Stats Row */}
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

        {/* Section C + D — License Status + Upcoming Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Section C — License Status Card */}
          <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-[22px]">
            <div className="font-heading text-[16px] font-semibold text-navy mb-3">License Status</div>
            {primaryLicense ? (
              <>
                {(() => {
                  const days = daysUntil(primaryLicense.expires_at);
                  return (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-[14px] text-[#2D2D2D]">{primaryLicense.license_type}</div>
                          <div className="text-[11px] text-muted mt-0.5">
                            Expires {new Date(primaryLicense.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          days < 0 ? "bg-red-50 text-[#C0392B]" :
                          days <= 60 ? "bg-[#FFFBF0] text-[#A87D42]" :
                          "bg-[#ECFDF5] text-[#2E7D52]"
                        }`}>
                          {days < 0 ? "Expired" : days <= 60 ? "Expiring" : "Active"}
                        </span>
                      </div>
                      <div className="mt-3 text-[12px]">
                        {days < 0
                          ? <span className="text-[#C0392B] font-semibold">Expired {Math.abs(days)} day{Math.abs(days) !== 1 ? "s" : ""} ago</span>
                          : <span className="text-muted">{days} days remaining</span>
                        }
                      </div>
                    </>
                  );
                })()}
                {licenseCount > 1 && (
                  <div className="mt-1 text-[11px] text-muted">+{licenseCount - 1} more license{licenseCount - 1 !== 1 ? "s" : ""}</div>
                )}
                <Link href="/licenses" className="mt-3 inline-block text-[12px] font-semibold text-navy hover:text-gold transition-colors">
                  View Details →
                </Link>
              </>
            ) : (
              <div className="py-4 text-center text-[13px] text-muted">
                <p>No licenses added yet.</p>
                <Link href="/licenses" className="text-navy font-semibold hover:text-gold mt-1 block">+ Add your first license</Link>
              </div>
            )}
            <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[14px] py-2.5 flex items-center gap-3 mt-4">
              <span className="text-[14px]">🔒</span>
              <p className="text-[11px] text-muted flex-1">Track all deadlines with alerts on Basic</p>
            </div>
          </div>

          {/* Section D — Upcoming Deadlines */}
          <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-[22px]">
            <div className="font-heading text-[16px] font-semibold text-navy mb-3">Upcoming Deadlines</div>
            {upcomingDeadlines.length === 0 ? (
              <div className="py-4 text-center text-[13px] text-muted">
                <p>No upcoming deadlines. You&apos;re in good shape.</p>
                <Link href="/licenses" className="text-gold font-semibold hover:text-[#A87D42] mt-1 block">+ Add a license →</Link>
              </div>
            ) : (
              <div className="divide-y divide-[#E2DFD8]">
                {upcomingDeadlines.map(lic => {
                  const days = daysUntil(lic.expires_at);
                  return (
                    <div key={lic.id} className="flex justify-between items-center py-2.5">
                      <div>
                        <div className="font-medium text-[13px] text-[#2D2D2D]">{lic.license_type}</div>
                        <div className="text-[11px] text-muted mt-0.5">
                          {new Date(lic.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        days < 0 ? "bg-red-50 text-[#C0392B]" :
                        days <= 60 ? "bg-[#FFFBF0] text-[#A87D42]" :
                        "bg-[#ECFDF5] text-[#2E7D52]"
                      }`}>
                        {days < 0 ? "Expired" : `${days} days`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[14px] py-2.5 flex items-center gap-3 mt-4">
              <span className="text-[14px]">🔒</span>
              <p className="text-[11px] text-muted flex-1">Get automated reminders with Basic</p>
            </div>
          </div>
        </div>

        {/* Compliance by Category */}
        <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-[22px]">
          <div className="font-heading text-[16px] font-semibold text-navy mb-3">Compliance by Category</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#2D2D2D]">Licenses & Permits</span>
                <span className="font-semibold" style={{ color: licenseCount > 0 ? "#2E7D52" : "#C0392B" }}>{licenseCount > 0 ? "100%" : "0%"}</span>
              </div>
              <div className="h-[5px] bg-cream rounded-full overflow-hidden">
                <div className="h-full bg-[#2E7D52] rounded-full" style={{ width: licenseCount > 0 ? "100%" : "0%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#2D2D2D]">Inspection Checklist</span>
                <span className="font-semibold" style={{ color: scoreColor }}>{complianceScore}%</span>
              </div>
              <div className="h-[5px] bg-cream rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${complianceScore}%`, background: scoreColor }} />
              </div>
            </div>
            <div className="opacity-40">
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#2D2D2D]">Staff Credentials</span>
                <span className="font-semibold text-muted">🔒</span>
              </div>
              <div className="h-[5px] bg-cream rounded-full" />
            </div>
            <div className="opacity-40">
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-[#2D2D2D]">Facility Safety</span>
                <span className="font-semibold text-muted">🔒</span>
              </div>
              <div className="h-[5px] bg-cream rounded-full" />
            </div>
          </div>
          <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[14px] py-2.5 flex items-center gap-3 mt-4">
            <span className="text-[14px]">🔒</span>
            <p className="text-[11px] text-muted flex-1">Full category tracking on Basic</p>
          </div>
        </div>

        {/* Section F — Recent Activity */}
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
                  <div className="text-muted text-[11px] whitespace-nowrap">{relativeTime(log.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section G — Upgrade Banner (dismissible, 14-day re-show) */}
        {showBanner && (
          <div className="bg-[#FFFBF0] border border-[#F5E6C8] rounded-[11px] px-[18px] py-3.5 flex flex-wrap items-center gap-2.5">
            <span className="text-[16px]">⭐</span>
            <div className="flex-1 min-w-[180px]">
              <div className="text-[12px] font-semibold text-[#A87D42]">Automated alerts available on Basic</div>
              <div className="text-[11px] text-muted">Get notified before deadlines, credential expirations, and regulatory changes.</div>
            </div>
            <SeePlansButton className="shrink-0 bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">
              See Plans
            </SeePlansButton>
            <form action={dismissBanner}>
              <button type="submit" className="shrink-0 w-6 h-6 flex items-center justify-center text-muted hover:text-navy transition-colors" aria-label="Dismiss">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Bottom Upgrade Banner */}
        <div className="bg-gradient-to-r from-cream to-[#E8E2D6] border border-[#E2DFD8] rounded-[11px] px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="flex-1 text-[13px] text-[#2D2D2D]">
            You&apos;re on the <strong>Free plan</strong>. Unlock credential tracking, automated alerts, document expiry tracking, and inspection readiness tools.
          </p>
          <SeePlansButton className="shrink-0 self-start sm:self-auto bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">
            Compare Plans
          </SeePlansButton>
        </div>

      </div>
    </>
  );
}

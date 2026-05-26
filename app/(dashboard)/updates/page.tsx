import { createClient } from "@/lib/supabase/server";
import Header from "@/components/dashboard/Header";
import SeePlansButton from "@/components/dashboard/SeePlansButton";

interface Update {
  id: string; title: string; summary: string; source_agency: string;
  update_type: string; published_date: string; external_url: string | null; is_legislative: boolean;
}

export default async function UpdatesPage() {
  const supabase = createClient();
  const { data: updates } = await supabase
    .from("regulatory_updates")
    .select("*")
    .order("published_date", { ascending: false });

  const allUpdates: Update[] = updates ?? [];
  const regular = allUpdates.filter(u => !u.is_legislative);

  // Show the 4 most recent as "unread" (has left border)
  return (
    <>
      <Header title="Regulatory Updates" />
      <div className="p-4 sm:p-[24px_28px] space-y-3">

        {/* Filter Bar — locked */}
        <div className="flex gap-2.5 mb-5 items-center">
          <select disabled className="px-2.5 py-[7px] border border-[#E2DFD8] rounded-[6px] text-[12px] opacity-45 cursor-not-allowed bg-white">
            <option>Filter by Agency</option>
          </select>
          <select disabled className="px-2.5 py-[7px] border border-[#E2DFD8] rounded-[6px] text-[12px] opacity-45 cursor-not-allowed bg-white">
            <option>Filter by Type</option>
          </select>
          <span className="text-[11px] text-muted">🔒 Agency filtering on Basic</span>
        </div>

        {/* Update Items */}
        {regular.map((update, i) => {
          const isUnread = i < 3; // First 3 treated as unread
          return (
            <div
              key={update.id}
              className={`bg-white border border-[#E2DFD8] rounded-[11px] p-5 ${isUnread ? "border-l-[3px] border-l-navy" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="font-heading text-[15px] font-semibold text-navy leading-snug flex-1 mr-2.5">
                  {update.title}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-gold shrink-0 mt-0.5">
                  {update.source_agency}
                </div>
              </div>
              <div className="text-[13px] text-muted leading-relaxed mt-2">{update.summary}</div>
              <div className="text-[11px] text-muted mt-2">
                {new Date(update.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {update.update_type}
              </div>
              {update.external_url && (
                <a href={update.external_url} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold text-navy hover:text-gold transition-colors mt-2 inline-block">
                  Read full update →
                </a>
              )}
            </div>
          );
        })}

        {/* Gate */}
        <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[18px] py-3.5 flex flex-wrap items-center gap-3 mt-4">
          <span className="text-[16px]">🔒</span>
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-[13px] font-semibold text-navy">Legislative Change Alerts</h4>
            <p className="text-[12px] text-muted">Track bills like SB 218 that directly affect your compliance. Available on Basic.</p>
          </div>
          <SeePlansButton className="shrink-0 bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">
            See Plans
          </SeePlansButton>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/dashboard/Header";
import Link from "next/link";
import SeePlansButton from "@/components/dashboard/SeePlansButton";

interface License {
  id: string;
  license_type: string;
  expires_at: string;
}

function daysUntil(dateStr: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - now.getTime()) / 86400000);
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const supabase = createClient();

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("licenses")
      .select("id, license_type, expires_at")
      .eq("user_id", user.id);
    setLicenses(data ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const deadlinesByDay: Record<number, License[]> = {};
  licenses.forEach((lic) => {
    const d = new Date(lic.expires_at);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const day = d.getDate();
      if (!deadlinesByDay[day]) deadlinesByDay[day] = [];
      deadlinesByDay[day].push(lic);
    }
  });

  const upcomingDeadlines = licenses
    .map((l) => ({ ...l, days: daysUntil(l.expires_at) }))
    .filter((l) => l.days >= -30)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  return (
    <>
      <Header title="Compliance Calendar" />
      <div className="p-4 sm:p-[24px_28px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* Calendar */}
          <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-[22px]">
            {/* Month nav */}
            <div className="flex justify-between items-center mb-4">
              <div className="font-heading text-[17px] font-semibold text-navy">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={prevMonth}
                  className="w-7 h-7 border border-[#E2DFD8] rounded-[6px] bg-white cursor-pointer text-[12px] hover:bg-cream transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={nextMonth}
                  className="w-7 h-7 border border-[#E2DFD8] rounded-[6px] bg-white cursor-pointer text-[12px] hover:bg-cream transition-colors"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 text-center mb-1">
              {DAY_LABELS.map((d, i) => (
                <div
                  key={i}
                  className="text-[10px] font-bold text-muted uppercase py-1.5"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e${i}`} className="min-h-[34px]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday =
                  viewYear === today.getFullYear() &&
                  viewMonth === today.getMonth() &&
                  day === today.getDate();
                const hasEvt = !!deadlinesByDay[day];
                return (
                  <div
                    key={day}
                    className="relative min-h-[34px] flex flex-col items-center justify-center text-[12px] rounded-[6px]"
                  >
                    {isToday ? (
                      <div className="w-8 h-8 rounded-full bg-navy text-white font-semibold flex items-center justify-center text-[12px]">
                        {day}
                      </div>
                    ) : (
                      <span
                        className={`${hasEvt ? "text-[#2D2D2D]" : "text-[#2D2D2D]"}`}
                      >
                        {day}
                      </span>
                    )}
                    {hasEvt && !isToday && (
                      <div className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Gate */}
            <div className="bg-cream border-l-[3px] border-gold rounded-r-[10px] px-[14px] py-2.5 flex flex-wrap items-center gap-3 mt-5">
              <span className="text-[16px]">🔒</span>
              <div className="flex-1 min-w-[160px]">
                <h4 className="text-[13px] font-semibold text-navy">
                  Set Up Automated Reminders
                </h4>
                <p className="text-[12px] text-muted">
                  Get email alerts at 30, 14, and 7 days before each deadline.
                </p>
              </div>
              <SeePlansButton className="shrink-0 bg-gold text-white rounded-[9px] px-[18px] py-2 text-[12px] font-semibold hover:bg-[#A87D42] transition-colors">
                See Plans
              </SeePlansButton>
            </div>
          </div>

          {/* Upcoming Deadlines sidebar */}
          <div className="bg-white border border-[#E2DFD8] rounded-[12px] p-[22px]">
            <div className="font-heading text-[16px] font-semibold text-navy mb-3.5">
              Upcoming Deadlines
            </div>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-6 text-[12px] text-muted">
                <p>No upcoming deadlines.</p>
                <Link
                  href="/licenses"
                  className="text-gold font-semibold hover:text-[#A87D42] mt-1 block"
                >
                  + Add a license →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#E2DFD8]">
                {upcomingDeadlines.map((lic) => (
                  <div key={lic.id} className="py-2.5 text-[12px]">
                    <div className="flex items-center gap-1.5 font-medium text-[#2D2D2D]">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${lic.days < 0 ? "bg-[#C0392B]" : lic.days <= 60 ? "bg-gold" : "bg-[#2E7D52]"}`}
                      />
                      {lic.license_type}
                    </div>
                    <div className="text-muted mt-0.5 ml-3">
                      {new Date(lic.expires_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {lic.days < 0 ? "Expired" : `${lic.days} days`}
                    </div>
                  </div>
                ))}
                <div className="pt-4 text-center text-[12px] text-muted">
                  Track more deadlines with Basic
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

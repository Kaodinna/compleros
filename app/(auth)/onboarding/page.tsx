"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

const PROGRAM_TYPES = [
  "Child Care Center",
  "Family Day Care Home",
  "Large Family Child Care Home",
  "VPK Provider",
  "School-Age Program",
  "Other",
];

const ENROLLMENT_RANGES = ["1–12", "13–25", "26–50", "51–100", "101+"];

const LICENSE_TYPES = [
  "Childcare Facility License",
  "Family Day Care Home License",
  "Large Family Child Care Home License",
  "VPK Provider Certificate",
  "Gold Seal Quality Care",
  "Other",
];

const STAFF_ROLES = [
  "Director",
  "Lead Teacher",
  "Assistant Teacher",
  "Aide",
  "Administrator",
  "Other",
];

interface FormData {
  programName: string;
  programType: string;
  county: string;
  enrollmentRange: string;
  licenseType: string;
  licenseNumber: string;
  issuedAt: string;
  expiresAt: string;
  staffFirstName: string;
  staffLastName: string;
  staffRole: string;
  staffEmail: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    programName: "",
    programType: "",
    county: "",
    enrollmentRange: "",
    licenseType: "",
    licenseNumber: "",
    issuedAt: "",
    expiresAt: "",
    staffFirstName: "",
    staffLastName: "",
    staffRole: "",
    staffEmail: "",
  });

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const step1Valid = form.programName.trim() && form.programType && form.county.trim();
  const step2Valid = form.licenseType && form.expiresAt;

  const handleFinish = async (skipStaff = false) => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Create program
      const { data: program, error: pErr } = await supabase
        .from("programs")
        .insert({
          user_id: user.id,
          name: form.programName.trim(),
          type: form.programType,
          county: form.county.trim(),
          enrollment_range: form.enrollmentRange || null,
        })
        .select("id")
        .single();
      if (pErr) throw pErr;

      // Create license
      const { error: lErr } = await supabase.from("licenses").insert({
        user_id: user.id,
        program_id: program.id,
        license_type: form.licenseType,
        license_number: form.licenseNumber.trim() || null,
        issued_at: form.issuedAt || null,
        expires_at: form.expiresAt,
      });
      if (lErr) throw lErr;

      // Create staff if provided
      if (!skipStaff && form.staffFirstName.trim() && form.staffLastName.trim() && form.staffRole) {
        await supabase.from("staff").insert({
          user_id: user.id,
          first_name: form.staffFirstName.trim(),
          last_name: form.staffLastName.trim(),
          role: form.staffRole,
          email: form.staffEmail.trim() || null,
        });
      }

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        icon: "🎉",
        description: `Set up program: ${form.programName.trim()}`,
      });

      // Mark onboarding complete — upsert in case the trigger didn't create the row yet
      const { error: profileErr } = await supabase
        .from("profiles")
        .upsert({ id: user.id, onboarding_complete: true }, { onConflict: "id" });
      if (profileErr) throw profileErr;

      setStep(4);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-[520px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo variant="navy" height={40} />
        </div>

        {step < 4 && (
          <>
            {/* Progress */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      s < step
                        ? "bg-navy text-white"
                        : s === step
                        ? "bg-gold text-white"
                        : "bg-[#E2DFD8] text-muted"
                    }`}
                  >
                    {s < step ? "✓" : s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-[2px] ${s < step ? "bg-navy" : "bg-[#E2DFD8]"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[16px] border border-border shadow-card p-8">
              {error && (
                <div className="mb-4 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
                  {error}
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <>
                  <h2 className="font-heading text-[22px] font-semibold text-navy mb-1">
                    Tell us about your program
                  </h2>
                  <p className="text-[13px] text-muted mb-6">
                    This helps us tailor your compliance dashboard.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">
                        Program Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.programName}
                        onChange={set("programName")}
                        placeholder="e.g. Sunshine Early Learning Center"
                        className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-navy/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">
                        Program Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.programType}
                        onChange={set("programType")}
                        className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white"
                      >
                        <option value="">Select type…</option>
                        {PROGRAM_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">
                        County <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.county}
                        onChange={set("county")}
                        placeholder="e.g. Miami-Dade"
                        className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-navy/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">
                        Enrollment Capacity
                      </label>
                      <select
                        value={form.enrollmentRange}
                        onChange={set("enrollmentRange")}
                        className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white"
                      >
                        <option value="">Select range…</option>
                        {ENROLLMENT_RANGES.map((r) => (
                          <option key={r} value={r}>{r} children</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => step1Valid && setStep(2)}
                    disabled={!step1Valid}
                    className="mt-6 w-full h-[44px] bg-navy text-white rounded-[10px] text-[14px] font-semibold disabled:opacity-40 hover:bg-navy/90 transition-colors"
                  >
                    Continue →
                  </button>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <>
                  <h2 className="font-heading text-[22px] font-semibold text-navy mb-1">
                    Add your primary license
                  </h2>
                  <p className="text-[13px] text-muted mb-6">
                    We'll track expiration and send renewal reminders.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">
                        License Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.licenseType}
                        onChange={set("licenseType")}
                        className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white"
                      >
                        <option value="">Select type…</option>
                        {LICENSE_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={form.licenseNumber}
                        onChange={set("licenseNumber")}
                        placeholder="Optional"
                        className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-navy/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[12px] font-semibold text-navy mb-1.5">
                          Issue Date
                        </label>
                        <input
                          type="date"
                          value={form.issuedAt}
                          onChange={set("issuedAt")}
                          className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-navy mb-1.5">
                          Expiration Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={form.expiresAt}
                          onChange={set("expiresAt")}
                          className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="h-[44px] px-5 border border-border rounded-[10px] text-[14px] text-muted hover:text-navy transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => step2Valid && setStep(3)}
                      disabled={!step2Valid}
                      className="flex-1 h-[44px] bg-navy text-white rounded-[10px] text-[14px] font-semibold disabled:opacity-40 hover:bg-navy/90 transition-colors"
                    >
                      Continue →
                    </button>
                  </div>
                </>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <>
                  <h2 className="font-heading text-[22px] font-semibold text-navy mb-1">
                    Add a staff member
                  </h2>
                  <p className="text-[13px] text-muted mb-6">
                    Optional — you can add more staff from your dashboard.
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[12px] font-semibold text-navy mb-1.5">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={form.staffFirstName}
                          onChange={set("staffFirstName")}
                          placeholder="Jane"
                          className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-navy/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-navy mb-1.5">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={form.staffLastName}
                          onChange={set("staffLastName")}
                          placeholder="Smith"
                          className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-navy/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">
                        Role
                      </label>
                      <select
                        value={form.staffRole}
                        onChange={set("staffRole")}
                        className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white"
                      >
                        <option value="">Select role…</option>
                        {STAFF_ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-navy mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.staffEmail}
                        onChange={set("staffEmail")}
                        placeholder="Optional"
                        className="w-full h-[42px] px-3 border border-border rounded-[10px] text-[14px] text-navy placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-navy/20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="h-[44px] px-5 border border-border rounded-[10px] text-[14px] text-muted hover:text-navy transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleFinish(true)}
                      disabled={loading}
                      className="h-[44px] px-4 border border-border rounded-[10px] text-[14px] text-muted hover:text-navy transition-colors disabled:opacity-40"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => handleFinish(false)}
                      disabled={loading}
                      className="flex-1 h-[44px] bg-navy text-white rounded-[10px] text-[14px] font-semibold disabled:opacity-40 hover:bg-navy/90 transition-colors"
                    >
                      {loading ? "Saving…" : "Finish Setup →"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Step 4 — Success */}
        {step === 4 && (
          <div className="bg-white rounded-[16px] border border-border shadow-card p-10 text-center">
            <div className="text-[48px] mb-4">🎉</div>
            <h2 className="font-heading text-[26px] font-semibold text-navy mb-2">
              You're all set!
            </h2>
            <p className="text-[14px] text-muted mb-8 max-w-[340px] mx-auto">
              Your compliance dashboard is ready. Track licenses, manage staff, and stay inspection-ready.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 h-[46px] px-8 bg-navy text-white rounded-[10px] text-[15px] font-semibold hover:bg-navy/90 transition-colors"
            >
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

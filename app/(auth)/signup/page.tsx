"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const orgTypes = [
  "Childcare Center",
  "Microschool",
  "Private School",
  "ECE Provider",
  "Other",
];

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    orgType: "",
    agreedToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, org_type: form.orgType },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-card shadow-card p-8 md:p-10 border border-border text-center">
          <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-[24px] mx-auto mb-5">
            ✓
          </div>
          <h1 className="font-heading text-[26px] font-semibold text-navy mb-3">
            Check your email
          </h1>
          <p className="text-[15px] text-muted leading-[1.7] mb-6">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-navy">{form.email}</span>.
            Click it to activate your account.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="bg-white rounded-card shadow-card p-8 md:p-10 border border-border">
        <h1 className="font-heading text-[28px] font-semibold text-navy mb-1">
          Start for free
        </h1>
        <p className="text-[14px] text-muted mb-8">
          Create your Compleros account — no credit card required
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="block text-[13px] font-semibold text-navy mb-1.5 tracking-[0.3px]"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="Jane Smith"
              className="w-full px-4 py-3 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy placeholder:text-muted/50"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-[13px] font-semibold text-navy mb-1.5 tracking-[0.3px]"
            >
              Work Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="jane@yourschool.com"
              className="w-full px-4 py-3 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy placeholder:text-muted/50"
            />
          </div>
          <div>
            <label
              htmlFor="orgType"
              className="block text-[13px] font-semibold text-navy mb-1.5 tracking-[0.3px]"
            >
              Organization Type
            </label>
            <select
              id="orgType"
              value={form.orgType}
              onChange={(e) => setForm((f) => ({ ...f, orgType: e.target.value }))}
              className="w-full px-4 py-3 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy"
            >
              <option value="">Select your organization type</option>
              {orgTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-[13px] font-semibold text-navy mb-1.5 tracking-[0.3px]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 pr-11 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy placeholder:text-muted/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreedToTerms}
              onChange={(e) => setForm((f) => ({ ...f, agreedToTerms: e.target.checked }))}
              className="mt-0.5 accent-navy"
            />
            <span className="text-[13px] text-muted leading-[1.6]">
              I agree to the{" "}
              <Link href="/terms" className="text-navy underline hover:no-underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-navy underline hover:no-underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          {error && (
            <p className="text-[13px] text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !form.fullName || !form.email || !form.password || !form.agreedToTerms}
            className="btn-primary w-full !py-3.5 !text-[15px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Create Free Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-navy font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

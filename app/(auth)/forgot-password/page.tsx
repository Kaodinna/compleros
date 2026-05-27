"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-white rounded-card shadow-card p-8 md:p-10 border border-border">
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-[24px] mx-auto mb-5">
              ✉️
            </div>
            <h1 className="font-heading text-[26px] font-semibold text-navy mb-3">
              Check your email
            </h1>
            <p className="text-[15px] text-muted leading-[1.7] mb-6">
              We sent a password reset link to{" "}
              <span className="font-semibold text-navy">{email}</span>.
            </p>
            <Link href="/login" className="btn-primary inline-block">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-heading text-[28px] font-semibold text-navy mb-1">
              Forgot password?
            </h1>
            <p className="text-[14px] text-muted mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[13px] font-semibold text-navy mb-1.5 tracking-[0.3px]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@yourschool.com"
                  className="w-full px-4 py-3 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy placeholder:text-muted/50"
                />
              </div>

              {error && <p className="text-[13px] text-danger">{error}</p>}

              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full !py-3.5 !text-[15px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-6 text-center text-[14px] text-muted">
              <Link href="/login" className="text-navy font-semibold hover:underline">
                ← Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

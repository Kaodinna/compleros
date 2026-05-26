"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-white rounded-card shadow-card p-8 md:p-10 border border-border">
        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-[24px] mx-auto mb-5">
              ✓
            </div>
            <h1 className="font-heading text-[26px] font-semibold text-navy mb-3">
              Password updated
            </h1>
            <p className="text-[15px] text-muted leading-[1.7]">
              Your password has been changed. Redirecting you to sign in…
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-heading text-[28px] font-semibold text-navy mb-1">
              Set new password
            </h1>
            <p className="text-[14px] text-muted mb-8">
              Choose a strong password for your account.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-[13px] font-semibold text-navy mb-1.5 tracking-[0.3px]"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 pr-11 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy placeholder:text-muted/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
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

              <div>
                <label
                  htmlFor="confirm"
                  className="block text-[13px] font-semibold text-navy mb-1.5 tracking-[0.3px]"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy placeholder:text-muted/50"
                />
              </div>

              {error && <p className="text-[13px] text-danger">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3.5 !text-[15px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

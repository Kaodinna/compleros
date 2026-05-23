"use client";

import { useState } from "react";

interface WaitlistInputProps {
  placeholder?: string;
  btnLabel?: string;
  btnClassName?: string;
  inputClassName?: string;
}

export default function WaitlistInput({
  placeholder = "Enter your work email",
  btnLabel = "Get Early Access",
  btnClassName = "bg-gold text-white hover:bg-gold-dark",
  inputClassName = "",
}: WaitlistInputProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <p className="text-sm font-semibold text-success bg-success/10 border border-success/20 rounded-btn px-5 py-3 inline-block">
        ✓ You&apos;re on the list — we&apos;ll be in touch soon!
      </p>
    );
  }

  return (
    <div className="w-full max-w-[460px]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 w-full"
        noValidate
      >
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 px-5 py-3.5 border border-border rounded-btn text-[15px] font-body bg-white outline-none transition-colors focus:border-navy placeholder:text-muted/60 ${inputClassName}`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`whitespace-nowrap px-7 py-3.5 rounded-btn font-semibold text-[15px] transition-all duration-200 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed ${btnClassName}`}
        >
          {loading ? "Joining…" : btnLabel}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-[13px] text-danger">{error}</p>
      )}
    </div>
  );
}

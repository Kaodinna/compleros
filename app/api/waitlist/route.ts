import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { waitlistConfirmation } from "@/lib/email/templates";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = (body.email ?? "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    // 23505 = unique_violation — already on list, still send success
    if (error.code !== "23505") {
      console.error("Waitlist insert error:", error.code, error.message);
      const msg = process.env.NODE_ENV === "development" ? error.message : "Something went wrong";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } else {
    // Only send confirmation email for new signups
    try {
      const { subject, html } = waitlistConfirmation(email);
      await sendEmail({ to: email, subject, html });
    } catch (emailErr) {
      console.error("Waitlist email error:", emailErr);
      // Don't fail the request if email fails
    }
  }

  return NextResponse.json({ success: true });
}

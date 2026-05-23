import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { contactConfirmation, contactNotification } from "@/lib/email/templates";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@compleros.com";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, email, subject, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("contacts").insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject?.trim() || "General Inquiry",
    message: message.trim(),
  });

  if (error) {
    console.error("Contact insert error:", error.code, error.message);
    const msg = process.env.NODE_ENV === "development" ? error.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Send both emails in parallel; don't fail the request if either fails
  try {
    await Promise.all([
      sendEmail({
        to: email.trim().toLowerCase(),
        ...contactConfirmation(name.trim(), subject?.trim() || "General Inquiry"),
      }),
      sendEmail({
        to: ADMIN_EMAIL,
        ...contactNotification({ name: name.trim(), email, subject: subject?.trim() || "General Inquiry", message: message.trim() }),
      }),
    ]);
  } catch (emailErr) {
    console.error("Contact email error:", emailErr);
  }

  return NextResponse.json({ success: true });
}

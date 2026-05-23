import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL ?? "info@compleros.com",
  name: "Compleros",
};

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await sgMail.send({ from: FROM, to, subject, html });
}

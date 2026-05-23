const brand = {
  navy: "#1B4D6B",
  navyDark: "#143A52",
  gold: "#C4985A",
  cream: "#F0EDE6",
  muted: "#6B7280",
};

function wrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Compleros</title>
</head>
<body style="margin:0;padding:0;background:#f7f6f3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f3;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;">
        <!-- Logo header -->
        <tr>
          <td style="background:${brand.navyDark};border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
            <span style="font-size:26px;font-weight:600;color:#ffffff;letter-spacing:-0.5px;font-family:Georgia,serif;">
              Compleros
            </span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;border-left:1px solid #e2dfd8;border-right:1px solid #e2dfd8;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:${brand.cream};border:1px solid #e2dfd8;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:${brand.muted};">
              &copy; ${new Date().getFullYear()} Compleros &bull; Built in Florida
            </p>
            <p style="margin:6px 0 0;font-size:12px;color:${brand.muted};">
              <a href="https://compleros.com/privacy" style="color:${brand.muted};">Privacy Policy</a>
              &nbsp;&bull;&nbsp;
              <a href="https://compleros.com/terms" style="color:${brand.muted};">Terms of Service</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:${brand.navy};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:9px;margin-top:8px;">${label}</a>`;
}

function h1(text: string) {
  return `<h1 style="margin:0 0 12px;font-size:26px;font-weight:600;color:${brand.navyDark};font-family:Georgia,serif;line-height:1.3;">${text}</h1>`;
}

function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;color:${brand.muted};line-height:1.7;">${text}</p>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e2dfd8;margin:24px 0;" />`;
}

// ── Waitlist confirmation (to subscriber) ──────────────────────
export function waitlistConfirmation(email: string) {
  return {
    subject: "You're on the Compleros waitlist 🎉",
    html: wrapper(`
      ${h1("You're on the list!")}
      ${p(`Thanks for your interest in Compleros. We've added <strong style="color:${brand.navy};">${email}</strong> to our early access list.`)}
      ${p("We're building Florida's first compliance management platform specifically for childcare centers, microschools, and private schools. You'll be among the first to know when we launch.")}
      ${divider()}
      ${p("In the meantime, feel free to reach out if you have any questions.")}
      ${btn("Visit Compleros", "https://compleros.com")}
    `),
  };
}

// ── Contact form confirmation (to sender) ─────────────────────
export function contactConfirmation(name: string, subject: string) {
  return {
    subject: `We received your message — ${subject}`,
    html: wrapper(`
      ${h1(`Hi ${name},`)}
      ${p("Thanks for reaching out to Compleros. We've received your message and will get back to you within 24 hours on business days.")}
      ${p(`<strong style="color:${brand.navy};">Subject:</strong> ${subject}`)}
      ${divider()}
      ${p("While you wait, feel free to explore our site to learn more about how Compleros helps Florida education providers stay inspection-ready.")}
      ${btn("Explore Compleros", "https://compleros.com")}
    `),
  };
}

// ── Contact form notification (to admin) ──────────────────────
export function contactNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return {
    subject: `[Contact] ${data.subject} — ${data.name}`,
    html: wrapper(`
      ${h1("New contact form submission")}
      ${p(`<strong style="color:${brand.navy};">From:</strong> ${data.name} &lt;${data.email}&gt;`)}
      ${p(`<strong style="color:${brand.navy};">Subject:</strong> ${data.subject}`)}
      ${divider()}
      ${p(`<strong style="color:${brand.navy};">Message:</strong><br/>${data.message.replace(/\n/g, "<br/>")}`)}
      ${divider()}
      ${btn("Reply to ${data.name}", `mailto:${data.email}`)}
    `),
  };
}

// ── Welcome email (after email confirmation) ──────────────────
export function welcomeEmail(name: string) {
  return {
    subject: "Welcome to Compleros — let's get you set up",
    html: wrapper(`
      ${h1(`Welcome, ${name}!`)}
      ${p("Your Compleros account is active. You're now ready to start tracking licenses, staff credentials, and compliance deadlines — all in one place.")}
      ${p("Here's what to do first:")}
      <ol style="margin:0 0 20px;padding-left:20px;font-size:15px;color:${brand.muted};line-height:2;">
        <li>Add your first license or permit</li>
        <li>Record your staff and their credentials</li>
        <li>Upload key compliance documents</li>
      </ol>
      ${p("Compleros will automatically alert you 30, 14, and 7 days before any deadline.")}
      ${btn("Go to Dashboard", "https://compleros.com/dashboard")}
    `),
  };
}

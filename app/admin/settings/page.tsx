"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { PageHeader, Btn, Toggle } from "@/components/admin/admin-ui";

interface AdminUser {
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  initials: string;
}

const ADMIN_USERS: AdminUser[] = [
  { name: "Steph Darilus",    email: "steph@compleros.com",    role: "CEO / Admin",    lastLogin: "Today, 9:14 AM",    initials: "SD" },
  { name: "Admin Account",   email: "chijiokenwoye64@gmail.com", role: "Super Admin", lastLogin: "Today",             initials: "AA" },
];

interface NotificationSetting {
  label: string;
  description: string;
  key: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  { label: "Email alerts for overdue items",     description: "Receive an email whenever a provider has overdue compliance items",    key: "email_overdue" },
  { label: "Weekly compliance digest",           description: "Summary of platform compliance status every Monday morning",           key: "weekly_digest" },
  { label: "New provider signups",               description: "Notify admins when a new provider registers on the platform",          key: "new_signups" },
  { label: "Subscription changes",              description: "Alerts for plan upgrades, downgrades, and cancellations",              key: "subscription_changes" },
  { label: "Legislative update alerts",          description: "Notify when new regulatory changes are added to the system",           key: "legislative_alerts" },
  { label: "Document upload notifications",      description: "Alert when providers upload new compliance documents",                 key: "doc_uploads" },
];

const AUTOMATION_SETTINGS = [
  { label: "Auto-remind at 30 days",         description: "Send reminder email to providers 30 days before item expiry",            key: "remind_30" },
  { label: "Auto-remind at 14 days",         description: "Send reminder email to providers 14 days before item expiry",            key: "remind_14" },
  { label: "Auto-remind at 7 days",          description: "Send reminder email to providers 7 days before item expiry",             key: "remind_7" },
  { label: "Auto-flag non-compliant",        description: "Automatically flag providers as non-compliant when items expire",        key: "auto_flag" },
  { label: "Auto-generate compliance score", description: "Recalculate provider compliance scores daily",                           key: "auto_score" },
  { label: "Auto-send renewal links",        description: "Include direct renewal links in automated reminder emails",              key: "renewal_links" },
];

const PLATFORM_SETTINGS = [
  { label: "Provider self-registration",     description: "Allow providers to sign up without admin invitation",                    key: "self_register" },
  { label: "Free tier access",               description: "Allow providers to use the platform on the free tier",                   key: "free_tier" },
  { label: "Resource page public access",    description: "Make the resources and blog page publicly accessible",                   key: "public_resources" },
  { label: "Document uploads (all tiers)",   description: "Allow free-tier providers to upload compliance documents",               key: "free_uploads" },
  { label: "Scholarship program tracking",   description: "Enable FTC, FES-EO, and Gardiner scholarship compliance modules",       key: "scholarship_tracking" },
  { label: "In-app messaging",               description: "Enable direct messaging between admin and providers",                   key: "in_app_messaging" },
];

export default function SettingsPage() {
  const { showToast } = useAdmin();

  const initKeys = (items: { key: string }[]) =>
    Object.fromEntries(items.map((i) => [i.key, true]));

  const [notifSettings, setNotifSettings]     = useState(initKeys(NOTIFICATION_SETTINGS));
  const [autoSettings, setAutoSettings]       = useState(initKeys(AUTOMATION_SETTINGS));
  const [platformSettings, setPlatformSettings] = useState<Record<string, boolean>>({
    ...initKeys(PLATFORM_SETTINGS.slice(0, 3)),
    free_uploads: false,
    scholarship_tracking: true,
    in_app_messaging: false,
  });

  const [branding, setBranding] = useState({ platformName: "Compleros", tagline: "Compliance made simple for Florida ECE providers", supportEmail: "support@compleros.com", primaryColor: "#1B4D6B" });
  const [adminEmails, setAdminEmails] = useState(ADMIN_USERS.map((u) => u.email).join(", "));
  const [inviteEmail, setInviteEmail] = useState("");

  function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h3 className="font-heading text-[1.05rem] font-normal text-navy">{title}</h3>
          {description && <p className="text-[0.8rem] text-muted mt-1">{description}</p>}
        </div>
        <div className="px-6 py-2">{children}</div>
        <div className="px-6 py-4 border-t border-border bg-cream/20 flex justify-end">
          <Btn primary onClick={() => showToast(`${title} settings saved`)}>Save Changes</Btn>
        </div>
      </div>
    );
  }

  function ToggleRow({ label, description, enabled, onToggle }: { label: string; description: string; enabled: boolean; onToggle: (v: boolean) => void }) {
    return (
      <div className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
        <div className="flex-1 pr-6">
          <p className="text-[0.88rem] font-medium text-navy">{label}</p>
          <p className="text-[0.78rem] text-muted mt-0.5">{description}</p>
        </div>
        <Toggle enabled={enabled} onChange={onToggle} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        title="Settings"
        subtitle="Platform configuration and admin preferences"
      />

      <div className="px-8 py-7 pb-12 space-y-5 max-w-[860px]">

        {/* Branding */}
        <Section title="Platform Branding" description="Customize the platform name and contact details shown to providers.">
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Platform Name</label>
                <input className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] outline-none focus:border-navy" value={branding.platformName} onChange={(e) => setBranding({ ...branding, platformName: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Support Email</label>
                <input className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] outline-none focus:border-navy" value={branding.supportEmail} onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Platform Tagline</label>
              <input className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] outline-none focus:border-navy" value={branding.tagline} onChange={(e) => setBranding({ ...branding, tagline: e.target.value })} />
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" description="Control which events trigger admin notification emails.">
          {NOTIFICATION_SETTINGS.map((s) => (
            <ToggleRow
              key={s.key}
              label={s.label}
              description={s.description}
              enabled={!!notifSettings[s.key]}
              onToggle={(v) => setNotifSettings({ ...notifSettings, [s.key]: v })}
            />
          ))}
        </Section>

        {/* Automation */}
        <Section title="Automation" description="Automated actions triggered by compliance events.">
          {AUTOMATION_SETTINGS.map((s) => (
            <ToggleRow
              key={s.key}
              label={s.label}
              description={s.description}
              enabled={!!autoSettings[s.key]}
              onToggle={(v) => setAutoSettings({ ...autoSettings, [s.key]: v })}
            />
          ))}
        </Section>

        {/* Platform features */}
        <Section title="Platform Features" description="Enable or disable platform-wide features for all providers.">
          {PLATFORM_SETTINGS.map((s) => (
            <ToggleRow
              key={s.key}
              label={s.label}
              description={s.description}
              enabled={!!platformSettings[s.key]}
              onToggle={(v) => setPlatformSettings({ ...platformSettings, [s.key]: v })}
            />
          ))}
        </Section>

        {/* Admin Users */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h3 className="font-heading text-[1.05rem] font-normal text-navy">Admin Access</h3>
            <p className="text-[0.8rem] text-muted mt-1">Manage accounts with admin access to this dashboard.</p>
          </div>
          <div className="px-6 py-2">
            {ADMIN_USERS.map((u) => (
              <div key={u.email} className="flex items-center gap-3 py-4 border-b border-border/50 last:border-0">
                <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-[0.8rem] font-bold text-white shrink-0">
                  {u.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.88rem] font-semibold text-navy">{u.name}</p>
                  <p className="text-[0.78rem] text-muted">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[0.76rem] font-semibold text-navy">{u.role}</p>
                  <p className="text-[0.72rem] text-muted">Last login: {u.lastLogin}</p>
                </div>
                {u.role !== "CEO / Admin" && (
                  <button onClick={() => showToast(`Removed ${u.name}`)} className="w-8 h-8 flex items-center justify-center border border-border rounded-md text-muted hover:border-danger hover:text-danger transition-all ml-2">
                    <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-border">
            <p className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold mb-3">Invite Admin</p>
            <div className="flex gap-2">
              <input
                className="flex-1 px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] outline-none focus:border-navy"
                placeholder="Enter email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Btn primary onClick={() => { if (inviteEmail) { showToast(`Invite sent to ${inviteEmail}`); setInviteEmail(""); } }}>
                Send Invite
              </Btn>
            </div>
            <p className="text-[0.72rem] text-muted mt-2">Admin access is controlled via the ADMIN_EMAILS environment variable.</p>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-danger/30 overflow-hidden">
          <div className="px-6 py-5 border-b border-danger/20">
            <h3 className="font-heading text-[1.05rem] font-normal text-danger">Danger Zone</h3>
            <p className="text-[0.8rem] text-muted mt-1">Irreversible actions. Proceed with caution.</p>
          </div>
          <div className="px-6 py-4 space-y-3">
            {[
              { label: "Flush all compliance alerts",   description: "Remove all resolved and dismissed alerts from the system.", action: "Alerts flushed" },
              { label: "Reset reminder schedule",       description: "Cancel all pending automated reminders. They will be regenerated on the next daily run.", action: "Reminder schedule reset" },
              { label: "Export full platform data",     description: "Download a complete data export including all providers, documents, and compliance records.", action: "Export initiated — check your email" },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-[0.88rem] font-medium text-navy">{d.label}</p>
                  <p className="text-[0.78rem] text-muted mt-0.5">{d.description}</p>
                </div>
                <Btn danger onClick={() => showToast(d.action)}>
                  {d.label.split(" ").slice(0, 2).join(" ")}
                </Btn>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

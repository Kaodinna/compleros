// TODO: re-enable auth guard before going to production
import AdminShell from "@/components/admin/AdminShell";

const MOCK_USER = {
  id: "dev",
  email: "chijiokenwoye64@gmail.com",
  user_metadata: { full_name: "Steph Darilus" },
  app_metadata: {},
  aud: "authenticated",
  created_at: "",
} as any;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell user={MOCK_USER}>{children}</AdminShell>;
}

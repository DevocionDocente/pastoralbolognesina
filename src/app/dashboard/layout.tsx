import { redirect } from "next/navigation";
import { AccessStatusScreen } from "@/modules/auth/ui/access-status-screen";
import { currentProfile } from "@/server/current-profile";
import { DashboardShell } from "@/shared/ui/dashboard/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await currentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "active") return <AccessStatusScreen profile={profile} />;
  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}

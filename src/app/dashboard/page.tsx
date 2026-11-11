import type { Metadata } from "next";
import { currentProfile } from "@/server/current-profile";
import { WelcomePanel } from "@/shared/ui/dashboard/welcome-panel";

export const metadata: Metadata = { title: "Panel" };

export default async function DashboardPage() {
  const profile = await currentProfile();
  return (
    <WelcomePanel
      name={profile?.name ?? ""}
      role={profile?.role?.name ?? null}
      canRegisterActivities={profile?.permissions.includes("activities.create") ?? false}
    />
  );
}

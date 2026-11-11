import type { ReactNode } from "react";
import type { UserProfile } from "@/modules/auth/domain/user-profile";
import { UserMenu } from "@/modules/auth/ui/user-menu";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";

export function DashboardShell({ profile, children }: { profile: UserProfile; children: ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar permissions={profile.permissions} />
        <SidebarInset>
          <DashboardHeader actions={<UserMenu profile={profile} />} />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

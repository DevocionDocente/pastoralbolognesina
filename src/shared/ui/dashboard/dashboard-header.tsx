import type { ReactNode } from "react";
import { Separator } from "@/shared/ui/separator";
import { SidebarTrigger } from "@/shared/ui/sidebar";

export function DashboardHeader({ actions }: { actions: ReactNode }) {
  return (
    <header className="flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="data-vertical:h-5 data-vertical:self-center" />
      <span className="text-sm text-muted-foreground">Panel de gestión</span>
      <div className="ml-auto">{actions}</div>
    </header>
  );
}

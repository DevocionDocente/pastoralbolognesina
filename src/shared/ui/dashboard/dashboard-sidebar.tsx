import type { Permission } from "@/modules/auth/domain/permissions";
import { BrandMark } from "@/shared/ui/brand-mark";
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu } from "@/shared/ui/sidebar";
import { NavLink } from "./nav-link";
import { visibleNavigation } from "./navigation";

export function DashboardSidebar({ permissions }: { permissions: Permission[] }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
        <BrandMark
          href="/dashboard"
          iconClassName="group-data-[collapsible=icon]:h-8"
          labelClassName="group-data-[collapsible=icon]:hidden"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {visibleNavigation(permissions).map(({ icon: Icon, ...item }) => (
              <NavLink key={item.href} {...item} icon={<Icon />} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

import { BookOpenIcon, CalendarHeartIcon, HandHeartIcon, HouseIcon, ShieldCheckIcon, UserCogIcon, UsersIcon, type LucideIcon } from "lucide-react";
import { CONTENT_PERMISSIONS, USER_ADMINISTRATION_PERMISSIONS, type Permission } from "@/modules/auth/domain/permissions";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permissions?: readonly Permission[];
  external?: boolean;
}

export const NAVIGATION: NavigationItem[] = [
  { href: "/dashboard", label: "Inicio", icon: HouseIcon },
  { href: "/dashboard/activities", label: "Actividades", icon: CalendarHeartIcon, permissions: CONTENT_PERMISSIONS },
  { href: "/dashboard/virtues", label: "Virtudes", icon: HandHeartIcon, permissions: ["virtues.manage"] },
  { href: "/dashboard/users", label: "Usuarios", icon: UsersIcon, permissions: USER_ADMINISTRATION_PERMISSIONS },
  { href: "/dashboard/roles", label: "Roles y permisos", icon: ShieldCheckIcon, permissions: ["roles.manage"] },
  { href: "/dashboard/account", label: "Mi cuenta", icon: UserCogIcon },
  { href: "/manual", label: "Manual de usuario", icon: BookOpenIcon, external: true },
];

export function visibleNavigation(permissions: Permission[]): NavigationItem[] {
  return NAVIGATION.filter((item) => !item.permissions || item.permissions.some((permission) => permissions.includes(permission)));
}

export interface UserAdminCapabilities {
  manageAccess: boolean;
  manageUsers: boolean;
}

export interface RoleOption {
  id: string;
  name: string;
}

export type { DialogControl } from "@/shared/ui/dialog-control";

export function roleOptions(roles: RoleOption[]) {
  return roles.map((role) => ({ value: role.id, label: role.name }));
}

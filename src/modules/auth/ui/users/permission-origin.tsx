import type { Permission } from "../../domain/permissions";
import type { UserPermissionsDto } from "../../http/user-schemas";

export function PermissionOrigin({ permission, permissions }: { permission: Permission; permissions: UserPermissionsDto }) {
  const override = permissions.overrides.find((item) => item.permission === permission);
  if (override?.granted) return <span className="text-xs text-primary">Agregado solo a esta persona</span>;
  if (override) return <span className="text-xs text-destructive">Quitado solo a esta persona</span>;
  if (permissions.rolePermissions.includes(permission)) return <span className="text-xs text-muted-foreground">Viene de su rol</span>;
  return null;
}

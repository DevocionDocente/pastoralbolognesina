import { PERMISSIONS, type Permission } from "./permissions";

export interface PermissionOverride {
  permission: Permission;
  granted: boolean;
}

export interface PermissionChanges {
  added: Permission[];
  removed: Permission[];
}

export function effectivePermissions(rolePermissions: readonly Permission[], overrides: readonly PermissionOverride[]): Permission[] {
  const effective = new Set(rolePermissions);
  for (const { permission, granted } of overrides) {
    if (granted) effective.add(permission);
    else effective.delete(permission);
  }
  return PERMISSIONS.filter((permission) => effective.has(permission));
}

export function overridesFor(rolePermissions: readonly Permission[], desired: readonly Permission[]): PermissionOverride[] {
  return PERMISSIONS.flatMap((permission) => {
    const fromRole = rolePermissions.includes(permission);
    const wanted = desired.includes(permission);
    return fromRole === wanted ? [] : [{ permission, granted: wanted }];
  });
}

export function permissionChanges(before: readonly Permission[], after: readonly Permission[]): PermissionChanges {
  return {
    added: after.filter((permission) => !before.includes(permission)),
    removed: before.filter((permission) => !after.includes(permission)),
  };
}

import type { PermissionOverride } from "../domain/user-permissions";

export interface UserPermissionRepository {
  overrides(userId: string): Promise<PermissionOverride[]>;
  replace(userId: string, overrides: readonly PermissionOverride[]): Promise<void>;
}

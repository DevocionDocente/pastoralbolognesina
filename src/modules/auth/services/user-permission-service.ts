import { NotFoundError, ValidationError } from "@/shared/domain/domain-error";
import type { Permission } from "../domain/permissions";
import { effectivePermissions, overridesFor, permissionChanges, type PermissionOverride } from "../domain/user-permissions";
import type { AccessHistoryRepository } from "../repositories/access-history-repository";
import type { RoleRepository } from "../repositories/role-repository";
import type { UserPermissionRepository } from "../repositories/user-permission-repository";
import type { UserRecord, UserRepository } from "../repositories/user-repository";
import type { Authorizer } from "./authorizer";

export interface UserPermissions {
  rolePermissions: Permission[];
  overrides: PermissionOverride[];
  effective: Permission[];
}

export class UserPermissionService {
  constructor(
    private readonly authorizer: Authorizer,
    private readonly users: UserRepository,
    private readonly roles: RoleRepository,
    private readonly userPermissions: UserPermissionRepository,
    private readonly history: AccessHistoryRepository,
  ) {}

  async get(actorId: string, userId: string): Promise<UserPermissions> {
    await this.authorizer.ensure(actorId, "users.manage");
    return this.load(await this.requireActive(userId));
  }

  async set(actorId: string, userId: string, desired: Permission[]): Promise<UserPermissions> {
    await this.authorizer.ensure(actorId, "users.manage");
    if (userId === actorId) throw new ValidationError("You cannot change your own access");
    const user = await this.requireActive(userId);
    const before = await this.load(user);
    await this.userPermissions.replace(user.id, overridesFor(before.rolePermissions, desired));
    const after = await this.load(user);
    await this.record(user, actorId, before.effective, after.effective);
    return after;
  }

  private async load(user: UserRecord): Promise<UserPermissions> {
    const [rolePermissions, overrides] = await Promise.all([
      user.role ? this.roles.findPermissions(user.role.id) : Promise.resolve([]),
      this.userPermissions.overrides(user.id),
    ]);
    return { rolePermissions, overrides, effective: effectivePermissions(rolePermissions, overrides) };
  }

  private async record(user: UserRecord, actorId: string, before: Permission[], after: Permission[]): Promise<void> {
    const { added, removed } = permissionChanges(before, after);
    if (added.length === 0 && removed.length === 0) return;
    await this.history.record({
      userId: user.id,
      action: "permissions_changed",
      roleName: user.role?.name ?? null,
      reason: null,
      note: null,
      addedPermissions: added,
      removedPermissions: removed,
      performedBy: actorId,
    });
  }

  private async requireActive(userId: string): Promise<UserRecord> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    if (user.status !== "active") throw new ValidationError("User must be active");
    return user;
  }
}

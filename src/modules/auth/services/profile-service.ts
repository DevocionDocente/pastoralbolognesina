import { NotFoundError } from "@/shared/domain/domain-error";
import type { Permission } from "../domain/permissions";
import { effectivePermissions } from "../domain/user-permissions";
import type { UserProfile } from "../domain/user-profile";
import type { RoleRepository } from "../repositories/role-repository";
import type { UserPermissionRepository } from "../repositories/user-permission-repository";
import type { UserRecord, UserRepository } from "../repositories/user-repository";

export class ProfileService {
  constructor(
    private readonly users: UserRepository,
    private readonly roles: RoleRepository,
    private readonly userPermissions: UserPermissionRepository,
  ) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    const permissions = await this.permissionsOf(user);
    return { id: user.id, name: user.name, email: user.email, status: user.status, role: user.role, permissions };
  }

  private async permissionsOf(user: UserRecord): Promise<Permission[]> {
    if (user.status !== "active" || !user.role) return [];
    const [rolePermissions, overrides] = await Promise.all([
      this.roles.findPermissions(user.role.id),
      this.userPermissions.overrides(user.id),
    ]);
    return effectivePermissions(rolePermissions, overrides);
  }
}

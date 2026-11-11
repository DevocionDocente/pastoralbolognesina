import { NotFoundError, ValidationError } from "@/shared/domain/domain-error";
import type { RevocationReason, UserStatus } from "../domain/access";
import type { AccessHistoryRepository } from "../repositories/access-history-repository";
import type { RoleDetails, RoleRepository } from "../repositories/role-repository";
import type { UserRecord, UserRepository } from "../repositories/user-repository";
import type { Authorizer } from "./authorizer";

export interface Revocation {
  reason: RevocationReason;
  note: string | null;
}

export class AccessService {
  constructor(
    private readonly authorizer: Authorizer,
    private readonly users: UserRepository,
    private readonly roles: RoleRepository,
    private readonly history: AccessHistoryRepository,
  ) {}

  async grant(actorId: string, userId: string, roleId: string): Promise<UserRecord> {
    await this.authorizer.ensure(actorId, "users.access");
    const user = await this.require(userId);
    if (user.id === actorId) throw new ValidationError("You cannot change your own access");
    const role = await this.requireRole(roleId);
    await this.users.setAccess(userId, { status: "active", roleId: role.id });
    await this.record(user.id, actorId, { action: "granted", roleName: role.name });
    return this.require(userId);
  }

  async revoke(actorId: string, userId: string, revocation: Revocation): Promise<UserRecord> {
    await this.authorizer.ensure(actorId, "users.access");
    const user = await this.require(userId);
    if (user.id === actorId) throw new ValidationError("You cannot revoke your own access");
    this.ensureStatus(user, "active");
    await this.users.setAccess(userId, { status: "revoked", roleId: null });
    await this.record(user.id, actorId, { action: "revoked", roleName: user.role?.name ?? null, ...revocation });
    return this.require(userId);
  }

  async reject(actorId: string, userId: string): Promise<void> {
    await this.authorizer.ensure(actorId, "users.access");
    const user = await this.require(userId);
    this.ensureStatus(user, "pending");
    await this.users.delete(userId);
  }

  private async record(
    userId: string,
    performedBy: string,
    entry: { action: "granted" | "revoked"; roleName: string | null; reason?: RevocationReason; note?: string | null },
  ) {
    await this.history.record({
      userId,
      performedBy,
      action: entry.action,
      roleName: entry.roleName,
      reason: entry.reason ?? null,
      note: entry.note ?? null,
    });
  }

  private ensureStatus(user: UserRecord, expected: UserStatus): void {
    if (user.status !== expected) throw new ValidationError(`User must be ${expected}`);
  }

  private async require(userId: string): Promise<UserRecord> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  private async requireRole(roleId: string): Promise<RoleDetails> {
    const role = await this.roles.findById(roleId);
    if (!role) throw new NotFoundError("Role not found");
    return role;
  }
}

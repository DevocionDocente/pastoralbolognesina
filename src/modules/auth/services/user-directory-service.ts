import { ConflictError, NotFoundError } from "@/shared/domain/domain-error";
import type { UserStatus } from "../domain/access";
import { USER_ADMINISTRATION_PERMISSIONS } from "../domain/permissions";
import type { AccessHistoryRepository, AccessRecord } from "../repositories/access-history-repository";
import type { RoleRepository } from "../repositories/role-repository";
import type { UserRecord, UserRepository } from "../repositories/user-repository";
import type { Authorizer } from "./authorizer";
import type { CredentialGateway, NewCredentialUser } from "./credential-gateway";

export class UserDirectoryService {
  constructor(
    private readonly authorizer: Authorizer,
    private readonly users: UserRepository,
    private readonly roles: RoleRepository,
    private readonly history: AccessHistoryRepository,
    private readonly credentials: CredentialGateway,
  ) {}

  async list(actorId: string, status?: UserStatus): Promise<UserRecord[]> {
    await this.authorizer.ensureAny(actorId, USER_ADMINISTRATION_PERMISSIONS);
    return this.users.list(status);
  }

  async create(actorId: string, input: NewCredentialUser & { roleId: string }): Promise<UserRecord> {
    await this.authorizer.ensure(actorId, "users.manage");
    await this.ensureEmailAvailable(input.email);
    const role = await this.roles.findById(input.roleId);
    if (!role) throw new NotFoundError("Role not found");
    const userId = await this.credentials.createActiveUser(input, role.id);
    await this.history.record({
      userId,
      action: "granted",
      roleName: role.name,
      reason: null,
      note: null,
      performedBy: actorId,
    });
    return this.require(userId);
  }

  async updateDetails(actorId: string, userId: string, details: { name: string; email: string }) {
    await this.authorizer.ensure(actorId, "users.manage");
    const user = await this.require(userId);
    if (user.email !== details.email.toLowerCase()) await this.ensureEmailAvailable(details.email);
    await this.users.updateDetails(userId, details);
    return this.require(userId);
  }

  async resetPassword(actorId: string, userId: string, password: string): Promise<void> {
    await this.authorizer.ensure(actorId, "users.manage");
    await this.require(userId);
    await this.credentials.setPassword(userId, password);
  }

  async accessHistory(actorId: string, userId: string): Promise<AccessRecord[]> {
    await this.authorizer.ensureAny(actorId, USER_ADMINISTRATION_PERMISSIONS);
    await this.require(userId);
    return this.history.listForUser(userId);
  }

  private async ensureEmailAvailable(email: string): Promise<void> {
    if (await this.users.findByEmail(email)) throw new ConflictError("Email already registered");
  }

  private async require(userId: string): Promise<UserRecord> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
}

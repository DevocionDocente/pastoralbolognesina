import { ConflictError, NotFoundError, ValidationError } from "@/shared/domain/domain-error";
import { ADMINISTRATOR_ROLE } from "../domain/default-roles";
import { USER_ADMINISTRATION_PERMISSIONS } from "../domain/permissions";
import type { RoleDetails, RoleInput, RoleRepository } from "../repositories/role-repository";
import type { Authorizer } from "./authorizer";

export class RoleService {
  constructor(
    private readonly authorizer: Authorizer,
    private readonly roles: RoleRepository,
  ) {}

  async list(actorId: string): Promise<RoleDetails[]> {
    await this.authorizer.ensureAny(actorId, [...USER_ADMINISTRATION_PERMISSIONS, "roles.manage"]);
    return this.roles.list();
  }

  async create(actorId: string, input: RoleInput): Promise<RoleDetails> {
    await this.authorizer.ensure(actorId, "roles.manage");
    await this.ensureNameAvailable(input.name);
    const role = await this.roles.create(input, false);
    return this.require(role.id);
  }

  async update(actorId: string, roleId: string, input: RoleInput): Promise<RoleDetails> {
    await this.authorizer.ensure(actorId, "roles.manage");
    const role = await this.require(roleId);
    if (role.name === ADMINISTRATOR_ROLE.name) throw new ValidationError("The administrator role cannot be edited");
    if (role.isSystem && role.name !== input.name) throw new ValidationError("System roles cannot be renamed");
    if (role.name !== input.name) await this.ensureNameAvailable(input.name);
    await this.roles.update(roleId, input);
    return this.require(roleId);
  }

  async delete(actorId: string, roleId: string): Promise<void> {
    await this.authorizer.ensure(actorId, "roles.manage");
    const role = await this.require(roleId);
    if (role.isSystem) throw new ValidationError("System roles cannot be deleted");
    if (role.userCount > 0) throw new ConflictError("The role still has assigned users");
    await this.roles.delete(roleId);
  }

  private async ensureNameAvailable(name: string): Promise<void> {
    if (await this.roles.findByName(name)) throw new ConflictError("A role with that name already exists");
  }

  private async require(roleId: string): Promise<RoleDetails> {
    const role = await this.roles.findById(roleId);
    if (!role) throw new NotFoundError("Role not found");
    return role;
  }
}

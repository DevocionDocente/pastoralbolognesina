import { ADMINISTRATOR_ROLE, DEFAULT_ROLES } from "../domain/default-roles";
import type { Role, RoleRepository } from "../repositories/role-repository";
import type { UserRepository } from "../repositories/user-repository";
import type { CredentialGateway, NewCredentialUser } from "./credential-gateway";

export class AuthSetupService {
  constructor(
    private readonly roles: RoleRepository,
    private readonly users: UserRepository,
    private readonly credentials: CredentialGateway,
  ) {}

  async ensureDefaults(rootAdmin: NewCredentialUser): Promise<void> {
    await this.ensureDefaultRoles();
    await this.ensureRootAdmin(rootAdmin);
  }

  private async ensureDefaultRoles(): Promise<void> {
    for (const definition of DEFAULT_ROLES) {
      const existing = await this.roles.findByName(definition.name);
      if (!existing) await this.roles.create(definition, true);
    }
    const administrator = await this.administratorRole();
    await this.roles.grantMissing(administrator.id, ADMINISTRATOR_ROLE.permissions);
  }

  private async ensureRootAdmin(rootAdmin: NewCredentialUser): Promise<void> {
    if (await this.users.findByEmail(rootAdmin.email)) return;
    const role = await this.administratorRole();
    await this.credentials.createActiveUser(rootAdmin, role.id);
  }

  private async administratorRole(): Promise<Role> {
    const role = await this.roles.findByName(ADMINISTRATOR_ROLE.name);
    if (!role) throw new Error("Administrator role was not seeded");
    return role;
  }
}

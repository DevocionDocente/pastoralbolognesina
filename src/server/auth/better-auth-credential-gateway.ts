import type { CredentialGateway, NewCredentialUser } from "@/modules/auth/services/credential-gateway";
import type { Auth } from "./create-auth";

export class BetterAuthCredentialGateway implements CredentialGateway {
  constructor(private readonly auth: Auth) {}

  async createActiveUser({ name, email, password }: NewCredentialUser, roleId: string): Promise<string> {
    const context = await this.auth.$context;
    const user = await context.internalAdapter.createUser(
      { name, email: email.toLowerCase(), emailVerified: true, status: "active", roleId },
      { method: "admin" },
    );
    await context.internalAdapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: await context.password.hash(password),
    });
    return user.id;
  }

  async setPassword(userId: string, password: string): Promise<void> {
    const context = await this.auth.$context;
    await context.internalAdapter.updatePassword(userId, await context.password.hash(password));
    await context.internalAdapter.deleteUserSessions(userId);
  }
}

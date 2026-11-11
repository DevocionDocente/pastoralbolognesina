import { ForbiddenError } from "@/shared/domain/domain-error";
import type { Permission } from "../domain/permissions";
import type { UserProfile } from "../domain/user-profile";
import type { ProfileService } from "./profile-service";

export class Authorizer {
  constructor(private readonly profiles: ProfileService) {}

  async ensure(actorId: string, permission: Permission): Promise<UserProfile> {
    const actor = await this.profiles.getProfile(actorId);
    if (!actor.permissions.includes(permission)) throw new ForbiddenError();
    return actor;
  }

  async ensureAny(actorId: string, permissions: readonly Permission[]): Promise<UserProfile> {
    const actor = await this.profiles.getProfile(actorId);
    if (!permissions.some((permission) => actor.permissions.includes(permission))) throw new ForbiddenError();
    return actor;
  }
}

import { CONTENT_PERMISSIONS, type Permission } from "@/modules/auth/domain/permissions";
import type { UserProfile } from "@/modules/auth/domain/user-profile";
import type { ProfileService } from "@/modules/auth/services/profile-service";
import { ForbiddenError } from "@/shared/domain/domain-error";
import type { Activity, MediaItem } from "../domain/activity";

export interface ActivityCapabilities {
  canEdit: boolean;
  canDelete: boolean;
  canUpload: boolean;
  canEditMedia: boolean;
  canDeleteAnyMedia: boolean;
  canEditProfile: boolean;
}

export class ActivityGuard {
  constructor(private readonly profiles: ProfileService) {}

  async ensureCanView(actorId: string): Promise<UserProfile> {
    const actor = await this.profiles.getProfile(actorId);
    if (!CONTENT_PERMISSIONS.some((permission) => actor.permissions.includes(permission))) throw new ForbiddenError();
    return actor;
  }

  async ensure(actorId: string, permission: Permission): Promise<UserProfile> {
    const actor = await this.profiles.getProfile(actorId);
    if (!actor.permissions.includes(permission)) throw new ForbiddenError();
    return actor;
  }

  async ensureCanEdit(actorId: string, activity: Activity): Promise<UserProfile> {
    const actor = await this.profiles.getProfile(actorId);
    if (!this.canEdit(actor, activity)) throw new ForbiddenError();
    return actor;
  }

  async ensureCanDeleteMedia(actorId: string, item: MediaItem): Promise<UserProfile> {
    const actor = await this.profiles.getProfile(actorId);
    if (!this.canDeleteMedia(actor, item)) throw new ForbiddenError();
    return actor;
  }

  canEdit(actor: UserProfile, activity: Activity): boolean {
    if (actor.permissions.includes("activities.update_any")) return true;
    return actor.permissions.includes("activities.update_own") && activity.createdBy?.id === actor.id;
  }

  canDeleteMedia(actor: UserProfile, item: MediaItem): boolean {
    if (actor.permissions.includes("media.delete")) return true;
    return actor.permissions.includes("media.upload") && item.uploadedBy === actor.id;
  }

  capabilities(actor: UserProfile, activity: Activity): ActivityCapabilities {
    const has = (permission: Permission) => actor.permissions.includes(permission);
    return {
      canEdit: this.canEdit(actor, activity),
      canDelete: has("activities.delete"),
      canUpload: has("media.upload"),
      canEditMedia: has("media.edit"),
      canDeleteAnyMedia: has("media.delete"),
      canEditProfile: has("profiles.edit"),
    };
  }
}

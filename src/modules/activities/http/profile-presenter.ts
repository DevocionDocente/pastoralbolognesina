import type { ActivityProfile, ActivityVirtue, Virtue } from "../domain/pastoral-profile";
import type { VirtueUsage } from "../repositories/virtue-repository";
import type { MediaUrlResolver } from "../services/media-url-resolver";
import type { ActivityVirtueDto, ProfileDto, VirtueDto, VirtueUsageDto } from "./profile-schemas";
import type { PublicProfileDto } from "./public-schemas";

export class ProfilePresenter {
  constructor(private readonly urls: MediaUrlResolver) {}

  async profile(profile: ActivityProfile): Promise<ProfileDto> {
    return {
      status: profile.status,
      pastoralDescription: profile.pastoralDescription,
      coexistenceImpact: profile.coexistenceImpact,
      imageUrl: await this.urls.imageUrl(profile.reflectionImageKey),
      manualFields: profile.manualFields,
      virtues: await Promise.all(profile.virtues.map((virtue) => this.activityVirtue(virtue))),
    };
  }

  async publicProfile(profile: ActivityProfile | null): Promise<PublicProfileDto | null> {
    if (!profile) return null;
    const { pastoralDescription, coexistenceImpact, imageUrl, virtues } = await this.profile(profile);
    return { pastoralDescription, coexistenceImpact, imageUrl, virtues };
  }

  async virtue({ id, name, explanation, imageKey }: Virtue): Promise<VirtueDto> {
    return { id, name, explanation, imageUrl: await this.urls.imageUrl(imageKey) };
  }

  async activityVirtue(virtue: ActivityVirtue): Promise<ActivityVirtueDto> {
    return { ...(await this.virtue(virtue)), ownExplanation: virtue.ownExplanation, ownImage: virtue.ownImageKey !== null };
  }

  async virtueUsage(usage: VirtueUsage): Promise<VirtueUsageDto> {
    return { ...(await this.virtue(usage)), activityCount: usage.activityCount };
  }
}

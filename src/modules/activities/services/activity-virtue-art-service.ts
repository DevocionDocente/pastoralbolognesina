import type { ActivityVirtue } from "../domain/pastoral-profile";
import type { ActivityRepository } from "../repositories/activity-repository";
import type { ProfileRepository } from "../repositories/profile-repository";
import type { ImageGenerator } from "./image-generator";
import type { ReflectionImageStore } from "./reflection-image-store";

export class ActivityVirtueArtService {
  constructor(
    private readonly activities: ActivityRepository,
    private readonly profiles: ProfileRepository,
    private readonly images: ImageGenerator,
    private readonly store: ReflectionImageStore,
  ) {}

  async draw(activityId: string, virtueId: string): Promise<void> {
    const [activity, profile] = await Promise.all([this.activities.findById(activityId), this.profiles.find(activityId)]);
    const virtue = profile?.virtues.find((candidate) => candidate.id === virtueId);
    if (!activity || !profile || !virtue) return;
    const image = await this.images.generate(scene(activity.name, profile.pastoralDescription, virtue));
    const key = await this.store.replace(`activities/${activityId}/virtues/${virtueId}`, image, virtue.ownImageKey);
    await this.profiles.setVirtueImage(activityId, virtueId, key);
  }
}

function scene(activityName: string, pastoralDescription: string | null, virtue: ActivityVirtue): string {
  return [
    `A scene from the school pastoral activity "${activityName}" that shows how the school community lives the Christian virtue "${virtue.name}".`,
    pastoralDescription ? `About the activity: ${pastoralDescription}` : null,
    `How the activity promotes this virtue: ${virtue.explanation}`,
  ]
    .filter(Boolean)
    .join("\n");
}

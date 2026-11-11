import { NotFoundError, ValidationError } from "@/shared/domain/domain-error";
import {
  MAX_VIRTUES,
  MIN_VIRTUES,
  normalizeVirtueName,
  type ActivityProfile,
  type ActivityVirtue,
  type ProfileField,
} from "../domain/pastoral-profile";
import type { ProfileRepository } from "../repositories/profile-repository";
import type { ActivityGuard } from "./activity-guard";
import type { ActivityService } from "./activity-service";
import type { AnalysisQueue } from "./analysis-queue";
import type { ReflectionImageStore } from "./reflection-image-store";
import type { ThumbnailGenerator } from "./thumbnail-generator";
import type { VirtueResolver } from "./virtue-resolver";

export interface VirtueEntryInput {
  name: string;
  explanation?: string | null;
}

export interface ProfileTextsInput {
  pastoralDescription?: string;
  coexistenceImpact?: string;
}

export class ProfileEditorService {
  constructor(
    private readonly guard: ActivityGuard,
    private readonly activities: ActivityService,
    private readonly profiles: ProfileRepository,
    private readonly resolver: VirtueResolver,
    private readonly store: ReflectionImageStore,
    private readonly thumbnails: ThumbnailGenerator,
    private readonly queue: AnalysisQueue,
  ) {}

  async get(actorId: string, activityId: string): Promise<ActivityProfile> {
    await this.guard.ensureCanView(actorId);
    return this.load(activityId);
  }

  async updateTexts(actorId: string, activityId: string, texts: ProfileTextsInput): Promise<ActivityProfile> {
    const profile = await this.editable(actorId, activityId);
    await this.profiles.saveTexts(activityId, texts);
    return this.markManual(profile, Object.keys(texts) as ProfileField[]);
  }

  async setVirtues(actorId: string, activityId: string, entries: VirtueEntryInput[]): Promise<ActivityProfile> {
    const profile = await this.editable(actorId, activityId);
    const virtues = await this.resolver.resolve(entries.map(({ name }) => ({ name, explanation: "" })), "manual");
    if (virtues.length < MIN_VIRTUES || virtues.length > MAX_VIRTUES) {
      throw new ValidationError(`An activity needs between ${MIN_VIRTUES} and ${MAX_VIRTUES} different virtues`);
    }
    const explanations = new Map(entries.map((entry) => [normalizeVirtueName(entry.name), entry.explanation?.trim() || null]));
    const removedImages = await this.profiles.setVirtues(
      activityId,
      virtues.map((virtue) => ({ virtueId: virtue.id, explanation: explanations.get(normalizeVirtueName(virtue.name)) ?? null })),
    );
    await this.store.removeAll(removedImages);
    return this.markManual(profile, ["virtues"]);
  }

  async replaceVirtueImage(actorId: string, activityId: string, virtueId: string, upload: Buffer): Promise<ActivityProfile> {
    const virtue = assigned(await this.editable(actorId, activityId), virtueId);
    const image = await this.thumbnails.reflection(upload);
    if (!image) throw new ValidationError("The file is not a valid image");
    const key = await this.store.replace(`activities/${activityId}/virtues/${virtueId}`, image, virtue.ownImageKey);
    await this.profiles.setVirtueImage(activityId, virtueId, key);
    return this.load(activityId);
  }

  async regenerateVirtueImage(actorId: string, activityId: string, virtueId: string): Promise<void> {
    assigned(await this.editable(actorId, activityId), virtueId);
    await this.queue.enqueueActivityVirtueArt(activityId, virtueId);
  }

  async resetVirtueImage(actorId: string, activityId: string, virtueId: string): Promise<ActivityProfile> {
    const virtue = assigned(await this.editable(actorId, activityId), virtueId);
    await this.profiles.setVirtueImage(activityId, virtueId, null);
    await this.store.remove(virtue.ownImageKey);
    return this.load(activityId);
  }

  async replaceImage(actorId: string, activityId: string, upload: Buffer): Promise<ActivityProfile> {
    const profile = await this.editable(actorId, activityId);
    const image = await this.thumbnails.reflection(upload);
    if (!image) throw new ValidationError("The file is not a valid image");
    const key = await this.store.replace(`activities/${activityId}`, image, profile.reflectionImageKey);
    await this.profiles.saveTexts(activityId, { reflectionImageKey: key });
    return this.markManual(profile, ["reflectionImage"]);
  }

  async regenerate(actorId: string, activityId: string, fields: ProfileField[]): Promise<ActivityProfile> {
    const profile = await this.editable(actorId, activityId);
    await this.profiles.setManualFields(activityId, profile.manualFields.filter((field) => !fields.includes(field)));
    await this.profiles.setStatus(activityId, "pending");
    await this.queue.enqueueProfile(activityId, fields);
    return this.load(activityId);
  }

  private async editable(actorId: string, activityId: string): Promise<ActivityProfile> {
    await this.guard.ensure(actorId, "profiles.edit");
    return this.load(activityId);
  }

  private async markManual(profile: ActivityProfile, fields: ProfileField[]): Promise<ActivityProfile> {
    await this.profiles.setManualFields(profile.activityId, [...profile.manualFields, ...fields]);
    return this.load(profile.activityId);
  }

  private async load(activityId: string): Promise<ActivityProfile> {
    await this.activities.require(activityId);
    return (await this.profiles.find(activityId))!;
  }
}

function assigned(profile: ActivityProfile, virtueId: string): ActivityVirtue {
  const virtue = profile.virtues.find((candidate) => candidate.id === virtueId);
  if (!virtue) throw new NotFoundError("The virtue is not assigned to this activity");
  return virtue;
}

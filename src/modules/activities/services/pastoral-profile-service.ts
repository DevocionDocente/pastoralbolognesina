import { activityContext } from "../domain/analysis";
import { MAX_VIRTUES, MIN_VIRTUES, PROFILE_FIELDS, type ActivityProfile, type ProfileField } from "../domain/pastoral-profile";
import type { ActivityAnalyses, AnalysisRepository } from "../repositories/analysis-repository";
import type { ProfileRepository } from "../repositories/profile-repository";
import type { VirtueRepository } from "../repositories/virtue-repository";
import type { AiClient, GeneratedProfile } from "./ai-client";
import type { AnalysisQueue } from "./analysis-queue";
import type { ImageGenerator } from "./image-generator";
import type { ReflectionImageStore } from "./reflection-image-store";
import type { VirtueResolver } from "./virtue-resolver";

const MAX_ITEMS = 40;

export class PastoralProfileService {
  constructor(
    private readonly profiles: ProfileRepository,
    private readonly analyses: AnalysisRepository,
    private readonly virtues: VirtueRepository,
    private readonly resolver: VirtueResolver,
    private readonly ai: AiClient,
    private readonly images: ImageGenerator,
    private readonly store: ReflectionImageStore,
    private readonly queue: AnalysisQueue,
  ) {}

  async generate(activityId: string, forced: ProfileField[] = []): Promise<void> {
    const profile = await this.profiles.find(activityId);
    const material = await this.analyses.activityAnalyses(activityId);
    if (!profile || !material || material.items.length === 0) return;
    const fields = fieldsToGenerate(profile, forced);
    if (fields.length === 0) return;
    await this.profiles.setStatus(activityId, "processing");
    try {
      await this.apply(profile, fields, await this.ai.pastoralProfile(await this.toMaterial(material)));
      await this.profiles.setStatus(activityId, "ready");
    } catch (error) {
      await this.profiles.setStatus(activityId, "error");
      throw error;
    }
  }

  async recoverMissing(): Promise<number> {
    const missing = await this.profiles.activitiesWithoutProfile();
    for (const activityId of missing) await this.queue.enqueueProfile(activityId);
    return missing.length;
  }

  private async apply(profile: ActivityProfile, fields: ProfileField[], generated: GeneratedProfile): Promise<void> {
    const { activityId } = profile;
    await this.profiles.saveTexts(activityId, {
      ...(fields.includes("pastoralDescription") && { pastoralDescription: generated.pastoralDescription }),
      ...(fields.includes("coexistenceImpact") && { coexistenceImpact: generated.coexistenceImpact }),
    });
    if (fields.includes("virtues")) await this.applyVirtues(activityId, generated.virtues);
    if (fields.includes("reflectionImage")) await this.applyImage(profile, generated.imagePrompt);
  }

  private async applyVirtues(activityId: string, entries: GeneratedProfile["virtues"]): Promise<void> {
    const resolved = await this.resolver.resolve(entries.slice(0, MAX_VIRTUES), "ai");
    if (resolved.length < MIN_VIRTUES) throw new Error(`Only ${resolved.length} virtues were generated`);
    const removedImages = await this.profiles.setVirtues(activityId, resolved.map((virtue) => ({ virtueId: virtue.id, explanation: null })));
    await this.store.removeAll(removedImages);
  }

  private async applyImage(profile: ActivityProfile, scene: string): Promise<void> {
    const image = await this.images.generate(scene);
    const key = await this.store.replace(`activities/${profile.activityId}`, image, profile.reflectionImageKey);
    await this.profiles.saveTexts(profile.activityId, { reflectionImageKey: key });
  }

  private async toMaterial(material: ActivityAnalyses) {
    const catalog = await this.virtues.list();
    return {
      context: activityContext(material.activity),
      summary: material.summary,
      items: material.items.slice(0, MAX_ITEMS),
      existingVirtues: catalog.map((virtue) => virtue.name),
    };
  }
}

function fieldsToGenerate(profile: ActivityProfile, forced: ProfileField[]): ProfileField[] {
  if (forced.length > 0) return forced;
  return PROFILE_FIELDS.filter((field) => {
    if (profile.manualFields.includes(field)) return false;
    return field !== "reflectionImage" || !profile.reflectionImageKey;
  });
}

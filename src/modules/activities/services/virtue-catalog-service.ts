import type { Authorizer } from "@/modules/auth/services/authorizer";
import { ConflictError, NotFoundError, ValidationError } from "@/shared/domain/domain-error";
import { cleanVirtueName, normalizeVirtueName, type Virtue } from "../domain/pastoral-profile";
import type { VirtueRepository, VirtueUsage } from "../repositories/virtue-repository";
import type { ActivityGuard } from "./activity-guard";
import type { AnalysisQueue } from "./analysis-queue";
import type { ReflectionImageStore } from "./reflection-image-store";
import type { ThumbnailGenerator } from "./thumbnail-generator";

export interface VirtueInput {
  name: string;
  explanation: string;
}

export class VirtueCatalogService {
  constructor(
    private readonly authorizer: Authorizer,
    private readonly guard: ActivityGuard,
    private readonly virtues: VirtueRepository,
    private readonly store: ReflectionImageStore,
    private readonly thumbnails: ThumbnailGenerator,
    private readonly queue: AnalysisQueue,
  ) {}

  async list(actorId: string): Promise<VirtueUsage[]> {
    await this.guard.ensureCanView(actorId);
    return this.virtues.list();
  }

  async create(actorId: string, input: VirtueInput): Promise<Virtue> {
    await this.authorizer.ensure(actorId, "virtues.manage");
    await this.ensureNameAvailable(input.name);
    const virtue = await this.virtues.create({ name: cleanVirtueName(input.name), explanation: input.explanation.trim(), source: "manual" });
    await this.queue.enqueueVirtueArt(virtue.id);
    return virtue;
  }

  async update(actorId: string, id: string, input: VirtueInput): Promise<Virtue> {
    await this.authorizer.ensure(actorId, "virtues.manage");
    await this.require(id);
    await this.ensureNameAvailable(input.name, id);
    await this.virtues.update(id, { name: cleanVirtueName(input.name), explanation: input.explanation.trim() });
    return this.require(id);
  }

  async delete(actorId: string, id: string): Promise<void> {
    await this.authorizer.ensure(actorId, "virtues.manage");
    const usage = (await this.virtues.list()).find((virtue) => virtue.id === id);
    if (!usage) throw new NotFoundError("Virtue not found");
    if (usage.activityCount > 0) throw new ConflictError("Virtue is assigned to activities");
    await this.virtues.delete(id);
    await this.store.remove(usage.imageKey);
  }

  async regenerateImage(actorId: string, id: string): Promise<void> {
    await this.authorizer.ensure(actorId, "virtues.manage");
    await this.require(id);
    await this.queue.enqueueVirtueArt(id, { renewImage: true });
  }

  async replaceImage(actorId: string, id: string, upload: Buffer): Promise<Virtue> {
    await this.authorizer.ensure(actorId, "virtues.manage");
    const virtue = await this.require(id);
    const image = await this.thumbnails.reflection(upload);
    if (!image) throw new ValidationError("The file is not a valid image");
    await this.virtues.setImage(id, await this.store.replace(`virtues/${id}`, image, virtue.imageKey));
    return this.require(id);
  }

  private async require(id: string): Promise<Virtue> {
    const virtue = await this.virtues.findById(id);
    if (!virtue) throw new NotFoundError("Virtue not found");
    return virtue;
  }

  private async ensureNameAvailable(name: string, exceptId?: string): Promise<void> {
    const [existing] = await this.virtues.findByNormalizedNames([normalizeVirtueName(name)]);
    if (existing && existing.id !== exceptId) throw new ConflictError("A virtue with that name already exists");
  }
}

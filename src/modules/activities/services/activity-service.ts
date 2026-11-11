import { NotFoundError } from "@/shared/domain/domain-error";
import type { Activity, ActivityInput, Series } from "../domain/activity";
import { resolveActivityYear } from "../domain/activity-year";
import type { ActivityRecordInput, ActivityRepository } from "../repositories/activity-repository";
import type { MediaRepository } from "../repositories/media-repository";
import type { ProfileRepository } from "../repositories/profile-repository";
import type { SeriesRepository } from "../repositories/series-repository";
import type { ActivityCapabilities, ActivityGuard } from "./activity-guard";
import type { AnalysisQueue } from "./analysis-queue";
import type { ObjectStorage } from "./object-storage";

export class ActivityService {
  constructor(
    private readonly guard: ActivityGuard,
    private readonly activities: ActivityRepository,
    private readonly series: SeriesRepository,
    private readonly media: MediaRepository,
    private readonly storage: ObjectStorage,
    private readonly profiles: ProfileRepository,
    private readonly queue: AnalysisQueue,
  ) {}

  async list(actorId: string, query?: string): Promise<Activity[]> {
    await this.guard.ensureCanView(actorId);
    return this.activities.list({ query });
  }

  async get(actorId: string, id: string): Promise<{ activity: Activity } & ActivityCapabilities> {
    const actor = await this.guard.ensureCanView(actorId);
    const activity = await this.require(id);
    return { activity, ...this.guard.capabilities(actor, activity) };
  }

  async listSeries(actorId: string): Promise<Series[]> {
    await this.guard.ensureCanView(actorId);
    return this.series.list();
  }

  async create(actorId: string, input: ActivityInput): Promise<Activity> {
    await this.guard.ensure(actorId, "activities.create");
    const id = await this.activities.create(await this.toRecord(input), actorId);
    return this.require(id);
  }

  async update(actorId: string, id: string, input: ActivityInput): Promise<Activity> {
    await this.guard.ensureCanEdit(actorId, await this.require(id));
    await this.activities.update(id, await this.toRecord(input));
    await this.queue.enqueueActivitySummary(id);
    return this.require(id);
  }

  async setPublished(actorId: string, id: string, published: boolean): Promise<Activity> {
    await this.guard.ensureCanEdit(actorId, await this.require(id));
    await this.activities.setPublished(id, published);
    return this.require(id);
  }

  async delete(actorId: string, id: string): Promise<void> {
    await this.guard.ensure(actorId, "activities.delete");
    await this.require(id);
    const [items, profile] = await Promise.all([this.media.listByActivity(id), this.profiles.find(id)]);
    const mediaKeys = items.flatMap((item) => [item.storageKey, item.thumbnailKey]);
    const profileKeys = [profile?.reflectionImageKey ?? null, ...(profile?.virtues.map((virtue) => virtue.ownImageKey) ?? [])];
    const keys = [...mediaKeys, ...profileKeys].filter((key) => key !== null);
    await this.storage.deleteObjects(keys);
    await this.activities.delete(id);
  }

  async require(id: string): Promise<Activity> {
    const activity = await this.activities.findById(id);
    if (!activity) throw new NotFoundError("Activity not found");
    return activity;
  }

  private async toRecord(input: ActivityInput): Promise<ActivityRecordInput> {
    const series = input.seriesName ? await this.series.findOrCreate(input.seriesName) : null;
    return {
      name: input.name,
      description: input.description,
      date: input.date,
      year: resolveActivityYear(input.date, input.year),
      seriesId: series?.id ?? null,
    };
  }
}

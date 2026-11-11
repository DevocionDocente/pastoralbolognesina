import { NotFoundError } from "@/shared/domain/domain-error";
import type { MediaItem } from "../domain/activity";
import type { MediaCategory } from "../domain/media-category";
import { parseYoutubeId } from "../domain/youtube";
import type { MediaRepository } from "../repositories/media-repository";
import type { ActivityGuard } from "./activity-guard";
import type { ActivityService } from "./activity-service";
import type { AnalysisQueue } from "./analysis-queue";
import type { ObjectStorage } from "./object-storage";
import type { YoutubeMetadata } from "./youtube-metadata";

export class MediaService {
  constructor(
    private readonly guard: ActivityGuard,
    private readonly activities: ActivityService,
    private readonly media: MediaRepository,
    private readonly storage: ObjectStorage,
    private readonly youtube: YoutubeMetadata,
    private readonly queue: AnalysisQueue,
  ) {}

  async list(actorId: string, activityId: string): Promise<MediaItem[]> {
    await this.guard.ensureCanView(actorId);
    await this.activities.require(activityId);
    return this.media.listByActivity(activityId);
  }

  async addYoutube(actorId: string, activityId: string, url: string): Promise<MediaItem> {
    await this.guard.ensure(actorId, "media.upload");
    await this.activities.require(activityId);
    const youtubeId = parseYoutubeId(url);
    const title = await this.youtube.titleOf(youtubeId);
    const item = await this.media.create({
      activityId,
      kind: "youtube",
      storageKey: null,
      thumbnailKey: null,
      youtubeId,
      originalName: title ?? "Video de YouTube",
      mimeType: null,
      sizeBytes: null,
      title,
      uploadedBy: actorId,
    });
    await this.queue.enqueueMedia(item.id, item.kind);
    return item;
  }

  async updateDetails(actorId: string, mediaId: string, details: { title: string | null; description: string | null }) {
    const item = await this.requireEditable(actorId, mediaId);
    await this.media.updateDetails(item.id, details);
    return (await this.media.findById(item.id))!;
  }

  async setCategory(actorId: string, mediaId: string, category: MediaCategory): Promise<MediaItem> {
    const item = await this.requireEditable(actorId, mediaId);
    await this.media.setCategory(item.id, category, "manual");
    return (await this.media.findById(item.id))!;
  }

  async delete(actorId: string, mediaId: string): Promise<void> {
    const item = await this.require(mediaId);
    await this.guard.ensureCanDeleteMedia(actorId, item);
    await this.storage.deleteObjects([item.storageKey, item.thumbnailKey].filter((key) => key !== null));
    await this.media.delete(item.id);
    await this.queue.enqueueActivitySummary(item.activityId);
  }

  private async requireEditable(actorId: string, mediaId: string): Promise<MediaItem> {
    await this.guard.ensure(actorId, "media.edit");
    return this.require(mediaId);
  }

  private async require(mediaId: string): Promise<MediaItem> {
    const item = await this.media.findById(mediaId);
    if (!item) throw new NotFoundError("Media not found");
    return item;
  }
}

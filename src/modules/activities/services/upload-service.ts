import { randomUUID } from "node:crypto";
import { ValidationError } from "@/shared/domain/domain-error";
import type { MediaItem } from "../domain/activity";
import { classifyFile, type ClassifiedFile } from "../domain/media-kind";
import type { MediaRepository } from "../repositories/media-repository";
import type { ActivityGuard } from "./activity-guard";
import type { ActivityService } from "./activity-service";
import type { AnalysisQueue } from "./analysis-queue";
import type { ObjectStorage, UploadedPart } from "./object-storage";
import type { ThumbnailGenerator } from "./thumbnail-generator";

const PART_SIZE = 16 * 1024 * 1024;

export interface UploadRequest {
  fileName: string;
  sizeBytes: number;
}

export interface UploadTicket {
  uploadId: string;
  key: string;
  partSize: number;
  partUrls: string[];
}

export interface CompletedUpload extends UploadRequest {
  uploadId: string;
  key: string;
  parts: UploadedPart[];
}

export class UploadService {
  constructor(
    private readonly guard: ActivityGuard,
    private readonly activities: ActivityService,
    private readonly media: MediaRepository,
    private readonly storage: ObjectStorage,
    private readonly thumbnails: ThumbnailGenerator,
    private readonly queue: AnalysisQueue,
  ) {}

  async start(actorId: string, activityId: string, request: UploadRequest): Promise<UploadTicket> {
    await this.guard.ensure(actorId, "media.upload");
    await this.activities.require(activityId);
    const file = classifyFile(request.fileName, request.sizeBytes);
    const key = `activities/${activityId}/${randomUUID()}.${file.extension}`;
    const uploadId = await this.storage.startMultipartUpload(key, file.mimeType);
    const partCount = Math.max(1, Math.ceil(request.sizeBytes / PART_SIZE));
    const partUrls = await Promise.all(
      Array.from({ length: partCount }, (_, index) => this.storage.presignUploadPart(key, uploadId, index + 1)),
    );
    return { uploadId, key, partSize: PART_SIZE, partUrls };
  }

  async complete(actorId: string, activityId: string, upload: CompletedUpload): Promise<MediaItem> {
    await this.guard.ensure(actorId, "media.upload");
    await this.activities.require(activityId);
    this.ensureKeyBelongsTo(activityId, upload.key);
    const file = classifyFile(upload.fileName, upload.sizeBytes);
    await this.storage.completeMultipartUpload(upload.key, upload.uploadId, upload.parts);
    const sizeBytes = await this.verifiedSize(upload.key, file, upload.fileName);
    const item = await this.media.create({
      activityId,
      kind: file.kind,
      storageKey: upload.key,
      thumbnailKey: file.kind === "photo" ? await this.createThumbnail(upload.key) : null,
      youtubeId: null,
      originalName: upload.fileName,
      mimeType: file.mimeType,
      sizeBytes,
      title: null,
      uploadedBy: actorId,
    });
    await this.queue.enqueueMedia(item.id, item.kind);
    return item;
  }

  async abort(actorId: string, activityId: string, upload: { uploadId: string; key: string }): Promise<void> {
    await this.guard.ensure(actorId, "media.upload");
    await this.activities.require(activityId);
    this.ensureKeyBelongsTo(activityId, upload.key);
    await this.storage.abortMultipartUpload(upload.key, upload.uploadId);
  }

  private ensureKeyBelongsTo(activityId: string, key: string): void {
    if (!key.startsWith(`activities/${activityId}/`)) throw new ValidationError("Upload does not belong to activity");
  }

  private async verifiedSize(key: string, file: ClassifiedFile, fileName: string): Promise<number> {
    const size = await this.storage.objectSize(key);
    try {
      classifyFile(fileName, size ?? 0);
      return size ?? 0;
    } catch (error) {
      await this.storage.deleteObjects([key]);
      throw error;
    }
  }

  private async createThumbnail(key: string): Promise<string | null> {
    const thumbnail = await this.thumbnails.fromImage(await this.storage.getObjectBytes(key));
    if (!thumbnail) return null;
    const thumbnailKey = key.replace(/^activities\//, "thumbnails/").replace(/\.[^.]+$/, ".webp");
    await this.storage.putObject(thumbnailKey, thumbnail, "image/webp");
    return thumbnailKey;
  }
}

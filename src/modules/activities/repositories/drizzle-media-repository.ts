import { and, asc, eq, isNull, max } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { mediaItems } from "../schema";
import type { MediaItem } from "../domain/activity";
import type { MediaCategory } from "../domain/media-category";
import type { MediaRepository, NewMediaItem } from "./media-repository";

export const mediaColumns = {
  id: mediaItems.id,
  activityId: mediaItems.activityId,
  kind: mediaItems.kind,
  storageKey: mediaItems.storageKey,
  thumbnailKey: mediaItems.thumbnailKey,
  youtubeId: mediaItems.youtubeId,
  originalName: mediaItems.originalName,
  mimeType: mediaItems.mimeType,
  sizeBytes: mediaItems.sizeBytes,
  title: mediaItems.title,
  description: mediaItems.description,
  analysisStatus: mediaItems.analysisStatus,
  analysisError: mediaItems.analysisError,
  category: mediaItems.category,
  categorySource: mediaItems.categorySource,
  uploadedBy: mediaItems.uploadedBy,
  createdAt: mediaItems.createdAt,
};

export class DrizzleMediaRepository implements MediaRepository {
  constructor(private readonly db: Database) {}

  async create(item: NewMediaItem): Promise<MediaItem> {
    const position = await this.nextPosition(item.activityId);
    const [created] = await this.db
      .insert(mediaItems)
      .values({ ...item, position })
      .returning(mediaColumns);
    return created;
  }

  async findById(id: string): Promise<MediaItem | null> {
    const [item] = await this.db.select(mediaColumns).from(mediaItems).where(eq(mediaItems.id, id));
    return item ?? null;
  }

  listByActivity(activityId: string): Promise<MediaItem[]> {
    return this.db
      .select(mediaColumns)
      .from(mediaItems)
      .where(eq(mediaItems.activityId, activityId))
      .orderBy(asc(mediaItems.position));
  }

  async updateDetails(id: string, details: { title: string | null; description: string | null }): Promise<void> {
    await this.db.update(mediaItems).set(details).where(eq(mediaItems.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(mediaItems).where(eq(mediaItems.id, id));
  }

  async setCategory(id: string, category: MediaCategory, source: "ai" | "manual"): Promise<void> {
    await this.db.update(mediaItems).set({ category, categorySource: source }).where(eq(mediaItems.id, id));
  }

  async listUncategorized(): Promise<string[]> {
    const rows = await this.db
      .select({ id: mediaItems.id })
      .from(mediaItems)
      .where(and(isNull(mediaItems.category), eq(mediaItems.analysisStatus, "ready")));
    return rows.map((row) => row.id);
  }

  private async nextPosition(activityId: string): Promise<number> {
    const [row] = await this.db
      .select({ last: max(mediaItems.position) })
      .from(mediaItems)
      .where(eq(mediaItems.activityId, activityId));
    return (row?.last ?? -1) + 1;
  }
}

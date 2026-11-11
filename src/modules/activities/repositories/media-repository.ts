import type { MediaItem } from "../domain/activity";
import type { MediaCategory } from "../domain/media-category";
import type { MediaKind } from "../domain/media-kind";

export interface NewMediaItem {
  activityId: string;
  kind: MediaKind;
  storageKey: string | null;
  thumbnailKey: string | null;
  youtubeId: string | null;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  title: string | null;
  uploadedBy: string;
}

export interface MediaRepository {
  create(item: NewMediaItem): Promise<MediaItem>;
  findById(id: string): Promise<MediaItem | null>;
  listByActivity(activityId: string): Promise<MediaItem[]>;
  updateDetails(id: string, details: { title: string | null; description: string | null }): Promise<void>;
  delete(id: string): Promise<void>;
  setCategory(id: string, category: MediaCategory, source: "ai" | "manual"): Promise<void>;
  listUncategorized(): Promise<string[]>;
}

import type { Activity, MediaItem } from "../domain/activity";
import type { GalleryFacets, GalleryFilter, GalleryMedia, MediaCounts } from "../domain/gallery";

export interface GalleryWindow {
  limit: number;
  offset: number;
}

export interface GalleryRepository {
  findActivities(filter: GalleryFilter, window: GalleryWindow): Promise<{ items: Activity[]; total: number }>;
  findMedia(filter: GalleryFilter, window: GalleryWindow): Promise<{ items: GalleryMedia[]; total: number }>;
  findPublishedActivity(id: string): Promise<Activity | null>;
  listSeriesEditions(seriesId: string): Promise<Activity[]>;
  covers(activityIds: string[]): Promise<Map<string, MediaItem>>;
  counts(activityIds: string[]): Promise<Map<string, MediaCounts>>;
  previews(activityIds: string[], perActivity: number): Promise<Map<string, MediaItem[]>>;
  facets(): Promise<GalleryFacets>;
}

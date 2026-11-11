import type { Activity } from "../domain/activity";
import type { GalleryFilter, GalleryMedia, SeriesOverview } from "../domain/gallery";
import type { CatalogEntry, KeywordMatch, SemanticMatch } from "../domain/search";

export interface SearchRepository {
  semantic(vector: number[], filter: GalleryFilter, limit: number, maxDistance: number): Promise<SemanticMatch[]>;
  keywordMedia(query: string, filter: GalleryFilter, limit: number): Promise<(KeywordMatch & { activityId: string })[]>;
  keywordActivities(phrases: string[], filter: GalleryFilter, limit: number): Promise<KeywordMatch[]>;
  catalog(): Promise<CatalogEntry[]>;
  matchingSeries(query: string): Promise<SeriesOverview[]>;
  media(ids: string[]): Promise<GalleryMedia[]>;
  activities(ids: string[]): Promise<Activity[]>;
}

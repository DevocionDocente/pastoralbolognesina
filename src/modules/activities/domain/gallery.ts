import type { Activity, MediaItem, Series } from "./activity";
import type { MediaCategory } from "./media-category";
import type { MediaKind } from "./media-kind";
import type { ActivityProfile } from "./pastoral-profile";

export const ACTIVITIES_PAGE_SIZE = 12;
export const MEDIA_PAGE_SIZE = 24;

export interface GalleryFilter {
  query?: string;
  fromYear?: number;
  toYear?: number;
  seriesId?: string;
  kind?: MediaKind;
  category?: MediaCategory;
  virtueId?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}

export type MediaCounts = Record<MediaKind, number>;

export interface ActivitySummary {
  activity: Activity;
  cover: MediaItem | null;
  counts: MediaCounts;
  profile: ActivityProfile | null;
}

export interface GalleryMedia {
  item: MediaItem;
  activity: { id: string; name: string; year: number };
}

export interface SeriesOverview extends Series {
  years: number[];
}

export interface GalleryFacets {
  years: number[];
  series: SeriesOverview[];
  virtues: Series[];
}

export function paginate<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

import { NotFoundError } from "@/shared/domain/domain-error";
import type { Activity, MediaItem } from "../domain/activity";
import {
  ACTIVITIES_PAGE_SIZE,
  MEDIA_PAGE_SIZE,
  paginate,
  type ActivitySummary,
  type GalleryFacets,
  type GalleryFilter,
  type GalleryMedia,
  type MediaCounts,
  type Paginated,
} from "../domain/gallery";
import type { GalleryRepository } from "../repositories/gallery-repository";
import type { MediaRepository } from "../repositories/media-repository";
import type { ProfileRepository } from "../repositories/profile-repository";
import type { ActivityProfile } from "../domain/pastoral-profile";

const EDITION_PREVIEWS = 4;

export interface SeriesEdition {
  activity: Activity;
  counts: MediaCounts;
  previews: MediaItem[];
}

export class PublicGalleryService {
  constructor(
    private readonly gallery: GalleryRepository,
    private readonly mediaItems: MediaRepository,
    private readonly profiles: ProfileRepository,
  ) {}

  async activities(filter: GalleryFilter, page: number): Promise<Paginated<ActivitySummary>> {
    const window = { limit: ACTIVITIES_PAGE_SIZE, offset: (page - 1) * ACTIVITIES_PAGE_SIZE };
    const { items, total } = await this.gallery.findActivities(filter, window);
    const ids = items.map((activity) => activity.id);
    const [covers, counts, profiles] = await Promise.all([this.gallery.covers(ids), this.gallery.counts(ids), this.profiles.findMany(ids)]);
    const summaries = items.map((activity) => ({
      activity,
      cover: covers.get(activity.id) ?? null,
      counts: counts.get(activity.id)!,
      profile: profiles.get(activity.id) ?? null,
    }));
    return paginate(summaries, total, page, ACTIVITIES_PAGE_SIZE);
  }

  async media(filter: GalleryFilter, page: number): Promise<Paginated<GalleryMedia>> {
    const window = { limit: MEDIA_PAGE_SIZE, offset: (page - 1) * MEDIA_PAGE_SIZE };
    const { items, total } = await this.gallery.findMedia(filter, window);
    return paginate(items, total, page, MEDIA_PAGE_SIZE);
  }

  async activity(id: string): Promise<{ activity: Activity; media: MediaItem[]; profile: ActivityProfile | null }> {
    const activity = await this.gallery.findPublishedActivity(id);
    if (!activity) throw new NotFoundError("Activity not found");
    const [media, profile] = await Promise.all([this.mediaItems.listByActivity(id), this.profiles.find(id)]);
    return { activity, media, profile };
  }

  async series(seriesId: string): Promise<{ name: string; editions: SeriesEdition[] }> {
    const activities = (await this.gallery.listSeriesEditions(seriesId)).reverse();
    if (activities.length === 0) throw new NotFoundError("Series not found");
    const ids = activities.map((activity) => activity.id);
    const [counts, previews] = await Promise.all([this.gallery.counts(ids), this.gallery.previews(ids, EDITION_PREVIEWS)]);
    const editions = activities.map((activity) => ({
      activity,
      counts: counts.get(activity.id)!,
      previews: previews.get(activity.id) ?? [],
    }));
    return { name: activities[0].series!.name, editions };
  }

  facets(): Promise<GalleryFacets> {
    return this.gallery.facets();
  }
}

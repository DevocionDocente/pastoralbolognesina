import type { MediaItem } from "../domain/activity";
import {
  ACTIVITIES_PAGE_SIZE,
  MEDIA_PAGE_SIZE,
  paginate,
  type ActivitySummary,
  type GalleryFilter,
  type GalleryMedia,
  type Paginated,
  type SeriesOverview,
} from "../domain/gallery";
import { evidenceSnippet, searchTerms, type ActivityHit } from "../domain/search";
import type { GalleryRepository } from "../repositories/gallery-repository";
import type { ProfileRepository } from "../repositories/profile-repository";
import type { SearchRepository } from "../repositories/search-repository";
import type { SearchRanker } from "./search-ranker";

const MIN_SERIES_QUERY = 4;

export interface MediaSearchResult extends GalleryMedia {
  evidence: string | null;
  second: number | null;
}

export interface ActivitySearchResult extends ActivitySummary {
  highlights: MediaItem[];
}

export class SearchService {
  constructor(
    private readonly search: SearchRepository,
    private readonly gallery: GalleryRepository,
    private readonly profiles: ProfileRepository,
    private readonly ranker: SearchRanker,
  ) {}

  async media(query: string, filter: GalleryFilter, page: number): Promise<Paginated<MediaSearchResult>> {
    const { media: hits } = await this.ranker.rank(query, filter);
    const window = hits.slice((page - 1) * MEDIA_PAGE_SIZE, page * MEDIA_PAGE_SIZE);
    const media = new Map((await this.search.media(window.map((hit) => hit.mediaId))).map((item) => [item.item.id, item]));
    const results = window.flatMap((hit) => {
      const item = media.get(hit.mediaId);
      return item ? [{ ...item, evidence: evidenceSnippet(hit.evidence), second: hit.second }] : [];
    });
    return paginate(results, hits.length, page, MEDIA_PAGE_SIZE);
  }

  async activities(query: string, filter: GalleryFilter, page: number): Promise<Paginated<ActivitySearchResult>> {
    const { activities: ranked } = await this.ranker.rank(query, filter);
    const window = ranked.slice((page - 1) * ACTIVITIES_PAGE_SIZE, page * ACTIVITIES_PAGE_SIZE);
    return paginate(await this.summaries(window), ranked.length, page, ACTIVITIES_PAGE_SIZE);
  }

  async series(query: string): Promise<SeriesOverview[]> {
    if (query.trim().length < MIN_SERIES_QUERY) return [];
    const terms = searchTerms(query, await this.ranker.expand(query));
    const matches = await Promise.all(terms.map((term) => this.search.matchingSeries(term)));
    return [...new Map(matches.flat().map((series) => [series.id, series])).values()];
  }

  private async summaries(window: ActivityHit[]): Promise<ActivitySearchResult[]> {
    const ids = window.map((hit) => hit.activityId);
    const [activities, covers, counts, highlightItems, profiles] = await Promise.all([
      this.search.activities(ids),
      this.gallery.covers(ids),
      this.gallery.counts(ids),
      this.search.media(window.flatMap((hit) => hit.mediaIds)),
      this.profiles.findMany(ids),
    ]);
    const byId = new Map(activities.map((activity) => [activity.id, activity]));
    const items = new Map(highlightItems.map((item) => [item.item.id, item.item]));
    return window.flatMap((hit) => {
      const activity = byId.get(hit.activityId);
      if (!activity) return [];
      const highlights = hit.mediaIds.map((id) => items.get(id)).filter((item): item is MediaItem => Boolean(item));
      const cover = highlights.find(isVisual) ?? covers.get(activity.id) ?? null;
      return [{ activity, cover, counts: counts.get(activity.id)!, highlights, profile: profiles.get(activity.id) ?? null }];
    });
  }
}

function isVisual(item: MediaItem): boolean {
  return item.kind === "photo" || item.kind === "youtube" || Boolean(item.thumbnailKey);
}

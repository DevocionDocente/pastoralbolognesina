import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { activities, activitySeries, activityVirtues, mediaItems, virtues } from "../schema";
import type { Activity, MediaItem } from "../domain/activity";
import type { GalleryFacets, GalleryFilter, GalleryMedia, MediaCounts } from "../domain/gallery";
import { MEDIA_KINDS } from "../domain/media-kind";
import { ActivityQuery } from "./activity-query";
import { mediaColumns } from "./drizzle-media-repository";
import { activityGalleryCondition, mediaGalleryCondition } from "./gallery-conditions";
import type { GalleryRepository, GalleryWindow } from "./gallery-repository";

const COVER_KINDS = ["photo", "youtube"] as const;

export class DrizzleGalleryRepository implements GalleryRepository {
  private readonly query: ActivityQuery;

  constructor(private readonly db: Database) {
    this.query = new ActivityQuery(db);
  }

  async findActivities(filter: GalleryFilter, window: GalleryWindow) {
    const condition = activityGalleryCondition(filter);
    const [items, total] = await Promise.all([this.query.find(condition, window), this.query.count(condition)]);
    return { items, total };
  }

  async findMedia(filter: GalleryFilter, window: GalleryWindow): Promise<{ items: GalleryMedia[]; total: number }> {
    const condition = mediaGalleryCondition(filter);
    const base = this.db
      .select({ item: mediaColumns, activityName: activities.name, year: activities.year, total: sql<number>`count(*) over()` })
      .from(mediaItems)
      .innerJoin(activities, eq(mediaItems.activityId, activities.id))
      .leftJoin(activitySeries, eq(activities.seriesId, activitySeries.id))
      .where(condition)
      .orderBy(desc(activities.year), sql`${activities.date} desc nulls last`, asc(mediaItems.position));
    const rows = await base.limit(window.limit).offset(window.offset);
    return {
      items: rows.map((row) => ({ item: row.item, activity: { id: row.item.activityId, name: row.activityName, year: row.year } })),
      total: Number(rows[0]?.total ?? 0),
    };
  }

  async findPublishedActivity(id: string): Promise<Activity | null> {
    const [activity] = await this.query.find(and(eq(activities.id, id), eq(activities.published, true)));
    return activity ?? null;
  }

  listSeriesEditions(seriesId: string): Promise<Activity[]> {
    return this.query.find(and(eq(activities.seriesId, seriesId), eq(activities.published, true)));
  }

  async covers(activityIds: string[]): Promise<Map<string, MediaItem>> {
    const previews = await this.previews(activityIds, 1);
    return new Map([...previews].map(([id, items]) => [id, items[0]]));
  }

  async previews(activityIds: string[], perActivity: number): Promise<Map<string, MediaItem[]>> {
    if (activityIds.length === 0) return new Map();
    const rows = await this.db
      .select(mediaColumns)
      .from(mediaItems)
      .where(and(inArray(mediaItems.activityId, activityIds), inArray(mediaItems.kind, [...COVER_KINDS])))
      .orderBy(asc(mediaItems.position));
    const grouped = new Map<string, MediaItem[]>();
    for (const row of rows) {
      const list = grouped.get(row.activityId) ?? [];
      if (list.length < perActivity) grouped.set(row.activityId, [...list, row]);
    }
    return grouped;
  }

  async counts(activityIds: string[]): Promise<Map<string, MediaCounts>> {
    if (activityIds.length === 0) return new Map();
    const rows = await this.db
      .select({ activityId: mediaItems.activityId, kind: mediaItems.kind, total: count() })
      .from(mediaItems)
      .where(inArray(mediaItems.activityId, activityIds))
      .groupBy(mediaItems.activityId, mediaItems.kind);
    const empty = () => Object.fromEntries(MEDIA_KINDS.map((kind) => [kind, 0])) as MediaCounts;
    const result = new Map(activityIds.map((id) => [id, empty()]));
    for (const row of rows) result.get(row.activityId)![row.kind] = row.total;
    return result;
  }

  async facets(): Promise<GalleryFacets> {
    const [years, series, usedVirtues] = await Promise.all([
      this.db
        .selectDistinct({ year: activities.year })
        .from(activities)
        .where(eq(activities.published, true))
        .orderBy(desc(activities.year)),
      this.db
        .select({ id: activitySeries.id, name: activitySeries.name, years: sql<number[]>`array_agg(distinct ${activities.year} order by ${activities.year})` })
        .from(activitySeries)
        .innerJoin(activities, and(eq(activities.seriesId, activitySeries.id), eq(activities.published, true)))
        .groupBy(activitySeries.id, activitySeries.name)
        .orderBy(asc(activitySeries.name)),
      this.db
        .selectDistinct({ id: virtues.id, name: virtues.name })
        .from(virtues)
        .innerJoin(activityVirtues, eq(activityVirtues.virtueId, virtues.id))
        .innerJoin(activities, and(eq(activities.id, activityVirtues.activityId), eq(activities.published, true)))
        .orderBy(asc(virtues.name)),
    ]);
    return { years: years.map((row) => row.year), series, virtues: usedVirtues };
  }
}

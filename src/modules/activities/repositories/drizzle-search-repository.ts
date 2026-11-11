import { and, asc, cosineDistance, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { activities, activitySeries, activityVirtues, mediaAnalyses, mediaChunks, mediaItems, virtues } from "../schema";
import type { Activity } from "../domain/activity";
import type { GalleryFilter, GalleryMedia, SeriesOverview } from "../domain/gallery";
import type { CatalogEntry, KeywordMatch, SemanticMatch } from "../domain/search";
import { ActivityQuery } from "./activity-query";
import { mediaColumns } from "./drizzle-media-repository";
import { mediaFilter, publishedActivities, withMatchingMedia } from "./gallery-conditions";
import type { SearchRepository } from "./search-repository";

const HNSW_CANDIDATES = 400;

function textSearch(document: SQL, query: string) {
  const tsQuery = sql`nullif(replace(plainto_tsquery('spanish', unaccent(${query}))::text, '&', '|'), '')::tsquery`;
  const vector = sql`to_tsvector('spanish', unaccent(${document}))`;
  return { matches: sql`${vector} @@ ${tsQuery}`, rank: sql<number>`ts_rank(${vector}, ${tsQuery})` };
}

function phraseSearch(document: SQL, phrases: string[]) {
  const tsQuery = sql.join(
    phrases.map((phrase) => sql`phraseto_tsquery('spanish', unaccent(${phrase}))`),
    sql` || `,
  );
  const vector = sql`to_tsvector('spanish', unaccent(${document}))`;
  return { matches: sql`${vector} @@ (${tsQuery})`, rank: sql<number>`ts_rank(${vector}, ${tsQuery})` };
}

const mediaDocument = sql`concat_ws(' ', ${mediaItems.title}, ${mediaItems.originalName}, ${mediaItems.description},
  ${mediaAnalyses.description}, array_to_string(${mediaAnalyses.tags}, ' '), ${mediaAnalyses.transcript},
  left(${mediaAnalyses.extractedText}, 20000))`;

const virtueNames = sql`(select string_agg(${virtues.name} || ' ' || ${virtues.explanation}, ' ') from ${activityVirtues}
  join ${virtues} on ${virtues.id} = ${activityVirtues.virtueId} where ${activityVirtues.activityId} = ${activities.id})`;

const activityDocument = sql`concat_ws(' ', ${activities.name}, ${activities.description}, ${activitySeries.name}, ${activities.aiSummary},
  ${activities.pastoralDescription}, ${activities.coexistenceImpact}, ${virtueNames})`;

export class DrizzleSearchRepository implements SearchRepository {
  private readonly query: ActivityQuery;

  constructor(private readonly db: Database) {
    this.query = new ActivityQuery(db);
  }

  semantic(vector: number[], filter: GalleryFilter, limit: number, maxDistance: number): Promise<SemanticMatch[]> {
    const distance = cosineDistance(mediaChunks.embedding, vector);
    return this.db.transaction(async (tx) => {
      await tx.execute(sql.raw(`set local hnsw.ef_search = ${HNSW_CANDIDATES}`));
      return tx
        .select({
          mediaId: mediaChunks.mediaId,
          activityId: mediaChunks.activityId,
          content: mediaChunks.content,
          second: mediaChunks.second,
          distance: sql<number>`${distance}`,
        })
        .from(mediaChunks)
        .innerJoin(mediaItems, eq(mediaChunks.mediaId, mediaItems.id))
        .innerJoin(activities, eq(mediaChunks.activityId, activities.id))
        .where(and(...publishedActivities(filter), mediaFilter(filter), sql`${distance} < ${maxDistance}`))
        .orderBy(distance)
        .limit(limit);
    });
  }

  async keywordMedia(query: string, filter: GalleryFilter, limit: number) {
    const { matches, rank } = textSearch(mediaDocument, query);
    const rows = await this.db
      .select({ id: mediaItems.id, activityId: mediaItems.activityId, rank })
      .from(mediaItems)
      .innerJoin(activities, eq(mediaItems.activityId, activities.id))
      .leftJoin(mediaAnalyses, eq(mediaAnalyses.mediaId, mediaItems.id))
      .where(and(...publishedActivities(filter), mediaFilter(filter), matches))
      .orderBy(desc(rank))
      .limit(limit);
    return rows;
  }

  async keywordActivities(phrases: string[], filter: GalleryFilter, limit: number): Promise<KeywordMatch[]> {
    const { matches, rank } = phraseSearch(activityDocument, phrases);
    return this.db
      .select({ id: activities.id, rank })
      .from(activities)
      .leftJoin(activitySeries, eq(activities.seriesId, activitySeries.id))
      .where(and(...publishedActivities(filter), withMatchingMedia(filter), matches))
      .orderBy(desc(rank))
      .limit(limit);
  }

  catalog(): Promise<CatalogEntry[]> {
    return this.db
      .select({ id: activities.id, name: activities.name, series: activitySeries.name })
      .from(activities)
      .leftJoin(activitySeries, eq(activities.seriesId, activitySeries.id))
      .where(eq(activities.published, true))
      .orderBy(desc(activities.year), asc(activities.name));
  }

  matchingSeries(query: string): Promise<SeriesOverview[]> {
    const normalizedQuery = sql`unaccent(lower(${query}))`;
    const normalizedName = sql`unaccent(lower(${activitySeries.name}))`;
    return this.db
      .select({
        id: activitySeries.id,
        name: activitySeries.name,
        years: sql<number[]>`array_agg(distinct ${activities.year} order by ${activities.year})`,
      })
      .from(activitySeries)
      .innerJoin(activities, and(eq(activities.seriesId, activitySeries.id), eq(activities.published, true)))
      .where(sql`(${normalizedQuery} like '%' || ${normalizedName} || '%' or ${normalizedName} like '%' || ${normalizedQuery} || '%')`)
      .groupBy(activitySeries.id, activitySeries.name)
      .orderBy(asc(activitySeries.name));
  }

  async media(ids: string[]): Promise<GalleryMedia[]> {
    if (ids.length === 0) return [];
    const rows = await this.db
      .select({ item: mediaColumns, activityName: activities.name, year: activities.year })
      .from(mediaItems)
      .innerJoin(activities, eq(mediaItems.activityId, activities.id))
      .where(inArray(mediaItems.id, ids));
    return rows.map((row) => ({ item: row.item, activity: { id: row.item.activityId, name: row.activityName, year: row.year } }));
  }

  activities(ids: string[]): Promise<Activity[]> {
    return ids.length === 0 ? Promise.resolve([]) : this.query.find(inArray(activities.id, ids));
  }
}

import { and, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { activities, activitySeries, activityVirtues, mediaItems } from "../schema";
import type { GalleryFilter } from "../domain/gallery";

function pattern(query: string) {
  return `%${query.replace(/[%_\\]/g, "").trim()}%`;
}

function textMatches(column: SQL | typeof activities.name, query: string) {
  return sql`unaccent(coalesce(${column}, '')) ilike unaccent(${pattern(query)})`;
}

export function activityMatches(query: string): SQL {
  return sql`(${textMatches(activities.name, query)}
    or ${textMatches(sql`${activities.description}`, query)}
    or ${textMatches(sql`${activitySeries.name}`, query)}
    or ${textMatches(sql`${activities.pastoralDescription}`, query)}
    or exists (select 1 from ${mediaItems} where ${mediaItems.activityId} = ${activities.id}
      and (${textMatches(sql`${mediaItems.title}`, query)} or ${textMatches(sql`${mediaItems.originalName}`, query)})))`;
}

export function mediaMatches(query: string): SQL {
  return sql`(${textMatches(sql`${mediaItems.title}`, query)}
    or ${textMatches(sql`${mediaItems.originalName}`, query)}
    or ${textMatches(sql`${mediaItems.description}`, query)}
    or ${textMatches(activities.name, query)}
    or ${textMatches(sql`${activitySeries.name}`, query)})`;
}

const effectiveCategory = sql`coalesce(${mediaItems.category},
  case ${mediaItems.kind} when 'photo' then 'image' when 'document' then 'other' else 'video' end)`;

export function publishedActivities(filter: GalleryFilter): SQL[] {
  const virtue = filter.virtueId
    ? sql`exists (select 1 from ${activityVirtues} where ${activityVirtues.activityId} = ${activities.id} and ${activityVirtues.virtueId} = ${filter.virtueId})`
    : undefined;
  return [
    eq(activities.published, true),
    filter.fromYear ? gte(activities.year, filter.fromYear) : undefined,
    filter.toYear ? lte(activities.year, filter.toYear) : undefined,
    filter.seriesId ? eq(activities.seriesId, filter.seriesId) : undefined,
    virtue,
  ].filter((condition): condition is SQL => condition !== undefined);
}

export function mediaFilter(filter: GalleryFilter): SQL | undefined {
  return and(
    filter.kind ? eq(mediaItems.kind, filter.kind) : undefined,
    filter.category ? sql`${effectiveCategory} = ${filter.category}` : undefined,
  );
}

export function withMatchingMedia(filter: GalleryFilter): SQL | undefined {
  const media = mediaFilter(filter);
  return media ? sql`exists (select 1 from ${mediaItems} where ${mediaItems.activityId} = ${activities.id} and ${media})` : undefined;
}

export function activityGalleryCondition(filter: GalleryFilter): SQL | undefined {
  return and(...publishedActivities(filter), filter.query ? activityMatches(filter.query) : undefined, withMatchingMedia(filter));
}

export function mediaGalleryCondition(filter: GalleryFilter): SQL | undefined {
  return and(...publishedActivities(filter), mediaFilter(filter), filter.query ? mediaMatches(filter.query) : undefined);
}

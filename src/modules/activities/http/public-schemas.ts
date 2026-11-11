import { z } from "@hono/zod-openapi";
import { MEDIA_CATEGORIES } from "../domain/media-category";
import { MEDIA_KINDS } from "../domain/media-kind";
import { MediaSchema, SeriesSchema } from "./activity-schemas";
import { ProfileSchema } from "./profile-schemas";

const year = z.coerce.number().int().min(1990).max(2100);

export const GalleryQuerySchema = z.object({
  q: z.string().trim().max(200).optional().openapi({ param: { name: "q", in: "query" }, example: "danza" }),
  from: year.optional().openapi({ param: { name: "from", in: "query" }, example: 2024 }),
  to: year.optional().openapi({ param: { name: "to", in: "query" }, example: 2026 }),
  series: z.uuid().optional().openapi({ param: { name: "series", in: "query" } }),
  kind: z.enum(MEDIA_KINDS).optional().openapi({ param: { name: "kind", in: "query" } }),
  category: z
    .enum(MEDIA_CATEGORIES)
    .optional()
    .openapi({ param: { name: "category", in: "query" }, description: "File type: activities with at least one file of this type" }),
  virtue: z.uuid().optional().openapi({ param: { name: "virtue", in: "query" }, description: "Only activities that promote this virtue" }),
  page: z.coerce.number().int().min(1).default(1).openapi({ param: { name: "page", in: "query" } }),
});

export const MediaCountsSchema = z
  .object(Object.fromEntries(MEDIA_KINDS.map((kind) => [kind, z.number().int()])) as Record<(typeof MEDIA_KINDS)[number], z.ZodNumber>)
  .openapi("MediaCounts");

export const PublicActivitySchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    description: z.string().nullable(),
    date: z.iso.date().nullable(),
    year: z.number().int(),
    series: SeriesSchema.nullable(),
    aiSummary: z.string().nullable(),
  })
  .openapi("PublicActivity");

export const PublicProfileSchema = ProfileSchema.pick({
  pastoralDescription: true,
  coexistenceImpact: true,
  imageUrl: true,
  virtues: true,
}).openapi("PublicPastoralProfile");

export const ActivityCardSchema = PublicActivitySchema.extend({
  cover: MediaSchema.nullable(),
  counts: MediaCountsSchema,
  profile: PublicProfileSchema.nullable().openapi({ description: "Pastoral profile; its reflection image is the card cover" }),
}).openapi("ActivityCard");

export const GalleryMediaSchema = MediaSchema.extend({
  activity: z.object({ id: z.uuid(), name: z.string(), year: z.number().int() }),
}).openapi("GalleryMedia");

export const PublicActivityDetailSchema = PublicActivitySchema.extend({
  media: z.array(MediaSchema),
  profile: PublicProfileSchema.nullable(),
}).openapi("PublicActivityDetail");

export const SeriesEditionSchema = PublicActivitySchema.extend({
  counts: MediaCountsSchema,
  previews: z.array(MediaSchema),
}).openapi("SeriesEdition");

export const SeriesTimelineSchema = z
  .object({ id: z.uuid(), name: z.string(), editions: z.array(SeriesEditionSchema) })
  .openapi("SeriesTimeline");

export const GalleryFacetsSchema = z
  .object({
    years: z.array(z.number().int()),
    series: z.array(SeriesSchema.extend({ years: z.array(z.number().int()) })),
    virtues: z.array(z.object({ id: z.uuid(), name: z.string() })).openapi({ description: "Virtues promoted by published activities" }),
  })
  .openapi("GalleryFacets");

const paginated = <T extends z.ZodType>(item: T, name: string) =>
  z
    .object({ items: z.array(item), total: z.number().int(), page: z.number().int(), pageCount: z.number().int() })
    .openapi(name);

export const ActivityPageSchema = paginated(ActivityCardSchema, "ActivityPage");

export const SearchQuerySchema = GalleryQuerySchema.extend({
  q: z.string().trim().min(1).max(200).openapi({ param: { name: "q", in: "query" }, example: "danza" }),
  view: z.enum(["activities", "media"]).default("activities").openapi({ param: { name: "view", in: "query" } }),
});

export const ActivitySearchCardSchema = ActivityCardSchema.extend({
  highlights: z.array(MediaSchema).openapi({ description: "Files of the activity that best match the query" }),
}).openapi("ActivitySearchCard");

export const MediaSearchItemSchema = GalleryMediaSchema.extend({
  evidence: z.string().nullable().openapi({ description: "Fragment of the AI analysis that matched the query" }),
  second: z.number().int().nullable().openapi({ description: "Second of the video where the match happens" }),
}).openapi("MediaSearchItem");

export const SeriesMatchSchema = SeriesSchema.extend({ years: z.array(z.number().int()) }).openapi("SeriesMatch");

export const SearchResponseSchema = z
  .object({
    query: z.string(),
    series: z.array(SeriesMatchSchema).openapi({ description: "Recurring activities named in the query, to compare their editions" }),
    activities: paginated(ActivitySearchCardSchema, "ActivitySearchPage").nullable(),
    media: paginated(MediaSearchItemSchema, "MediaSearchPage").nullable(),
  })
  .openapi("SearchResponse");
export const MediaPageSchema = paginated(GalleryMediaSchema, "GalleryMediaPage");

export type GalleryQuery = z.infer<typeof GalleryQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type ActivitySearchCardDto = z.infer<typeof ActivitySearchCardSchema>;
export type MediaSearchItemDto = z.infer<typeof MediaSearchItemSchema>;
export type SeriesMatchDto = z.infer<typeof SeriesMatchSchema>;
export type SearchResponseDto = z.infer<typeof SearchResponseSchema>;
export type ActivityCardDto = z.infer<typeof ActivityCardSchema>;
export type GalleryMediaDto = z.infer<typeof GalleryMediaSchema>;
export type PublicActivityDetailDto = z.infer<typeof PublicActivityDetailSchema>;
export type SeriesTimelineDto = z.infer<typeof SeriesTimelineSchema>;
export type SeriesEditionDto = z.infer<typeof SeriesEditionSchema>;
export type GalleryFacetsDto = z.infer<typeof GalleryFacetsSchema>;
export type PublicProfileDto = z.infer<typeof PublicProfileSchema>;
export type PageDto<T> = { items: T[]; total: number; page: number; pageCount: number };

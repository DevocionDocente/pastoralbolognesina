import { createRoute, z } from "@hono/zod-openapi";
import { errorResponse } from "@/server/http/error-schema";
import { IdParam } from "./activity-schemas";
import {
  ActivityPageSchema,
  GalleryFacetsSchema,
  GalleryQuerySchema,
  MediaPageSchema,
  PublicActivityDetailSchema,
  SearchQuerySchema,
  SearchResponseSchema,
  SeriesTimelineSchema,
} from "./public-schemas";

const tags = ["Public gallery"];
const json = <T extends z.ZodType>(schema: T) => ({ content: { "application/json": { schema } } });

export const publicActivitiesRoute = createRoute({
  method: "get",
  path: "/public/activities",
  tags,
  summary: "Browse published activities with filters, newest first",
  request: { query: GalleryQuerySchema },
  responses: { 200: { description: "Page of activities", ...json(ActivityPageSchema) } },
});

export const publicMediaRoute = createRoute({
  method: "get",
  path: "/public/media",
  tags,
  summary: "Browse individual photos, videos and documents of published activities",
  request: { query: GalleryQuerySchema },
  responses: { 200: { description: "Page of media", ...json(MediaPageSchema) } },
});

export const publicActivityRoute = createRoute({
  method: "get",
  path: "/public/activities/{id}",
  tags,
  summary: "Get a published activity with all of its media",
  request: { params: IdParam },
  responses: {
    200: { description: "Activity", ...json(PublicActivityDetailSchema) },
    404: errorResponse("Activity not found or not published"),
  },
});

export const publicSeriesRoute = createRoute({
  method: "get",
  path: "/public/series/{id}",
  tags,
  summary: "Get every published edition of a recurring activity, ordered by year",
  request: { params: IdParam },
  responses: {
    200: { description: "Timeline", ...json(SeriesTimelineSchema) },
    404: errorResponse("Series not found"),
  },
});

export const publicFacetsRoute = createRoute({
  method: "get",
  path: "/public/filters",
  tags,
  summary: "List the years and recurring activities available for filtering",
  responses: { 200: { description: "Filter options", ...json(GalleryFacetsSchema) } },
});

export const searchRoute = createRoute({
  method: "get",
  path: "/search",
  tags,
  summary: "Smart search: AI query expansion, hybrid retrieval and AI relevance filtering",
  description:
    "Finds photos, videos and documents by what they show, say or contain (for example `danza` finds a photo of people dancing even if nobody typed that word). The AI first expands the query with equivalent terms (`cristo moreno` also searches `Señor de los Milagros`), then semantic and Spanish full-text results are fused with Reciprocal Rank Fusion, and finally the AI keeps only the activities that clearly answer the query (`santa rosa` does not return Semana Santa). If the AI is unavailable the unfiltered ranking is returned. Use `view=activities` to group by activity or `view=media` for files of the relevant activities. `series` lists recurring activities named in the query or its equivalents.",
  request: { query: SearchQuerySchema },
  responses: { 200: { description: "Search results", ...json(SearchResponseSchema) } },
});

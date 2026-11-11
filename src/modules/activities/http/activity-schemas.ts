import { z } from "@hono/zod-openapi";
import { MEDIA_CATEGORIES } from "../domain/media-category";
import { MEDIA_KINDS } from "../domain/media-kind";

export const IdParam = z.object({ id: z.uuid().openapi({ param: { name: "id", in: "path" } }) });

export const SeriesSchema = z
  .object({ id: z.uuid(), name: z.string().openapi({ example: "Semana Santa" }) })
  .openapi("ActivitySeries");

export const ActivitySchema = z
  .object({
    id: z.uuid(),
    name: z.string().openapi({ example: "Procesión de Semana Santa" }),
    description: z.string().nullable(),
    date: z.iso.date().nullable().openapi({ example: "2025-04-18" }),
    year: z.number().int().openapi({ example: 2025 }),
    series: SeriesSchema.nullable(),
    published: z.boolean(),
    aiSummary: z.string().nullable().openapi({ description: "AI summary built from the analysis of every file" }),
    createdBy: z.object({ id: z.string(), name: z.string() }).nullable(),
    mediaCount: z.number().int(),
    createdAt: z.iso.datetime(),
  })
  .openapi("Activity");

export const ActivityDetailSchema = ActivitySchema.extend({
  canEdit: z.boolean().openapi({ description: "Can edit and publish this activity" }),
  canDelete: z.boolean().openapi({ description: "Can delete activities" }),
  canUpload: z.boolean().openapi({ description: "Can upload files and YouTube links" }),
  canEditMedia: z.boolean().openapi({ description: "Can edit file details and file type" }),
  canDeleteAnyMedia: z.boolean().openapi({ description: "Can delete any file; uploaders can always delete their own files" }),
  canEditProfile: z.boolean().openapi({ description: "Can edit the pastoral profile" }),
}).openapi("ActivityDetail");

export const ActivityInputSchema = z
  .object({
    name: z.string().trim().min(1).max(200).openapi({ example: "Procesión de Semana Santa" }),
    description: z.string().trim().max(5000).nullable().default(null),
    date: z.iso.date().nullable().default(null).openapi({ example: "2025-04-18" }),
    year: z.number().int().nullable().default(null).openapi({ description: "Required when there is no date; from 2023 to the current year", example: 2024 }),
    seriesName: z.string().trim().max(120).nullable().default(null).openapi({ example: "Semana Santa" }),
  })
  .openapi("ActivityInput");

export const ActivityListQuery = z.object({
  q: z.string().optional().openapi({ param: { name: "q", in: "query" }, example: "procesión" }),
});

export const PublicationSchema = z.object({ published: z.boolean() }).openapi("Publication");

export const MediaSchema = z
  .object({
    id: z.uuid(),
    kind: z.enum(MEDIA_KINDS),
    originalName: z.string().openapi({ example: "Programa Semana Santa 2024.docx" }),
    mimeType: z.string().nullable(),
    sizeBytes: z.number().int().nullable(),
    title: z.string().nullable(),
    description: z.string().nullable(),
    youtubeId: z.string().nullable(),
    analysisStatus: z.enum(["pending", "processing", "ready", "error"]),
    analysisError: z.string().nullable(),
    category: z.enum(MEDIA_CATEGORIES).openapi({ description: "File type shown to families; assigned by the AI unless edited" }),
    categorySource: z.enum(["ai", "manual", "default"]),
    thumbnailUrl: z.string().nullable(),
    viewUrl: z.string(),
    downloadUrl: z.string().nullable(),
    createdAt: z.iso.datetime(),
  })
  .openapi("Media");

export const UploadRequestSchema = z
  .object({
    fileName: z.string().min(1).max(255).openapi({ example: "Procesion-01.jpg" }),
    sizeBytes: z.number().int().positive().openapi({ example: 3_145_728 }),
  })
  .openapi("UploadRequest");

export const UploadTicketSchema = z
  .object({
    uploadId: z.string(),
    key: z.string(),
    partSize: z.number().int(),
    partUrls: z.array(z.string()).openapi({ description: "Presigned PUT URLs, one per part, in order" }),
  })
  .openapi("UploadTicket");

export const CompleteUploadSchema = UploadRequestSchema.extend({
  uploadId: z.string(),
  key: z.string(),
  parts: z.array(z.object({ partNumber: z.number().int().positive(), etag: z.string() })).min(1),
}).openapi("CompleteUpload");

export const AbortUploadSchema = z.object({ uploadId: z.string(), key: z.string() }).openapi("AbortUpload");

export const YoutubeInputSchema = z
  .object({ url: z.url().openapi({ example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }) })
  .openapi("YoutubeInput");

export const MediaDetailsSchema = z
  .object({
    title: z.string().trim().max(200).nullable(),
    description: z.string().trim().max(2000).nullable(),
  })
  .openapi("MediaDetails");

export const AnalysisSchema = z
  .object({
    status: z.enum(["pending", "processing", "ready", "error"]),
    error: z.string().nullable(),
    description: z.string().nullable().openapi({ example: "Un grupo de niños baila con sombreros en el patio." }),
    tags: z.array(z.string()).openapi({ example: ["danza", "sombreros", "patio"] }),
    transcript: z.string().nullable(),
    extractedText: z.string().nullable(),
    moments: z.array(z.object({ second: z.number().int(), text: z.string() })),
    model: z.string().nullable(),
    updatedAt: z.iso.datetime().nullable(),
  })
  .openapi("MediaAnalysis");

export type AnalysisDto = z.infer<typeof AnalysisSchema>;
export type ActivityDto = z.infer<typeof ActivitySchema>;
export type ActivityDetailDto = z.infer<typeof ActivityDetailSchema>;
export type ActivityInputDto = z.input<typeof ActivityInputSchema>;
export type SeriesDto = z.infer<typeof SeriesSchema>;
export type MediaDto = z.infer<typeof MediaSchema>;
export type UploadTicketDto = z.infer<typeof UploadTicketSchema>;
export type CompleteUploadDto = z.infer<typeof CompleteUploadSchema>;
export type MediaDetailsDto = z.infer<typeof MediaDetailsSchema>;

export const MediaCategoryInputSchema = z
  .object({ category: z.enum(MEDIA_CATEGORIES).openapi({ example: "financial_report" }) })
  .openapi("MediaCategoryInput");

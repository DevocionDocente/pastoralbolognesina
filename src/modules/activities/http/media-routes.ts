import { createRoute, z } from "@hono/zod-openapi";
import { errorResponse } from "@/server/http/error-schema";
import {
  AbortUploadSchema,
  AnalysisSchema,
  CompleteUploadSchema,
  IdParam,
  MediaCategoryInputSchema,
  MediaDetailsSchema,
  MediaSchema,
  UploadRequestSchema,
  UploadTicketSchema,
  YoutubeInputSchema,
} from "./activity-schemas";

const tags = ["Media"];
const security = [{ session: [] }];
const json = <T extends z.ZodType>(schema: T) => ({ content: { "application/json": { schema } } });
const mediaResponse = { description: "Media item", ...json(MediaSchema) };
const errors = {
  401: errorResponse("No active session"),
  403: errorResponse("Cannot edit this activity"),
  404: errorResponse("Activity or media not found"),
};

export const listMediaRoute = createRoute({
  method: "get",
  path: "/activities/{id}/media",
  tags,
  security,
  summary: "List the files and videos of an activity with temporary URLs",
  request: { params: IdParam },
  responses: { 200: { description: "Media items", ...json(z.array(MediaSchema)) }, ...errors },
});

export const startUploadRoute = createRoute({
  method: "post",
  path: "/activities/{id}/uploads",
  tags,
  security,
  summary: "Start a direct multipart upload to storage and get presigned part URLs",
  description:
    "Upload each part with PUT to its URL, keep the ETag response header, then call the complete endpoint. Photos and documents up to 50 MB, videos up to 4 GB.",
  request: { params: IdParam, body: json(UploadRequestSchema) },
  responses: {
    201: { description: "Upload ticket", ...json(UploadTicketSchema) },
    ...errors,
    400: errorResponse("Unsupported file type or file too large"),
  },
});

export const completeUploadRoute = createRoute({
  method: "post",
  path: "/activities/{id}/uploads/complete",
  tags,
  security,
  summary: "Finish a multipart upload and register the file with its original name",
  request: { params: IdParam, body: json(CompleteUploadSchema) },
  responses: { 201: mediaResponse, ...errors, 400: errorResponse("Invalid upload") },
});

export const abortUploadRoute = createRoute({
  method: "post",
  path: "/activities/{id}/uploads/abort",
  tags,
  security,
  summary: "Cancel a multipart upload",
  request: { params: IdParam, body: json(AbortUploadSchema) },
  responses: { 204: { description: "Upload cancelled" }, ...errors },
});

export const addYoutubeRoute = createRoute({
  method: "post",
  path: "/activities/{id}/media/youtube",
  tags,
  security,
  summary: "Add a YouTube video by URL",
  request: { params: IdParam, body: json(YoutubeInputSchema) },
  responses: { 201: mediaResponse, ...errors, 400: errorResponse("Invalid YouTube URL") },
});

export const updateMediaRoute = createRoute({
  method: "patch",
  path: "/media/{id}",
  tags,
  security,
  summary: "Update the optional title and description of a file",
  request: { params: IdParam, body: json(MediaDetailsSchema) },
  responses: { 200: mediaResponse, ...errors },
});

export const deleteMediaRoute = createRoute({
  method: "delete",
  path: "/media/{id}",
  tags,
  security,
  summary: "Delete a file or video from an activity",
  request: { params: IdParam },
  responses: { 204: { description: "Media deleted" }, ...errors },
});

export const getAnalysisRoute = createRoute({
  method: "get",
  path: "/media/{id}/analysis",
  tags,
  security,
  summary: "Get what the AI understood from a file and its analysis status",
  request: { params: IdParam },
  responses: { 200: { description: "Analysis", ...json(AnalysisSchema) }, ...errors },
});

export const retryAnalysisRoute = createRoute({
  method: "post",
  path: "/media/{id}/analysis/retry",
  tags,
  security,
  summary: "Queue the AI analysis of a file again",
  request: { params: IdParam },
  responses: { 202: mediaResponse, ...errors },
});

export const setMediaCategoryRoute = createRoute({
  method: "patch",
  path: "/media/{id}/category",
  tags,
  security,
  summary: "Set the file type by hand (Plan Pastoral, Informe, Balance Económico...)",
  description: "A manual type is never overwritten by the AI classification.",
  request: { params: IdParam, body: json(MediaCategoryInputSchema) },
  responses: { 200: mediaResponse, ...errors },
});

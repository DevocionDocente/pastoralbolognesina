import { createRoute, z } from "@hono/zod-openapi";
import { errorResponse } from "@/server/http/error-schema";
import { IdParam } from "./activity-schemas";
import { ImageUploadSchema, VirtueInputSchema, VirtueSchema, VirtueUsageSchema } from "./profile-schemas";

const tags = ["Virtues"];
const security = [{ session: [] }];
const json = <T extends z.ZodType>(schema: T) => ({ content: { "application/json": { schema } } });
const virtueResponse = { description: "Virtue", ...json(VirtueSchema) };
const errors = {
  401: errorResponse("No active session"),
  403: errorResponse("Missing permission virtues.manage"),
  404: errorResponse("Virtue not found"),
};

export const listVirtuesRoute = createRoute({
  method: "get",
  path: "/virtues",
  tags,
  security,
  summary: "List the shared virtues catalog with how many activities use each virtue",
  responses: { 200: { description: "Virtues", ...json(z.array(VirtueUsageSchema)) }, 401: errors[401], 403: errors[403] },
});

export const createVirtueRoute = createRoute({
  method: "post",
  path: "/virtues",
  tags,
  security,
  summary: "Add a virtue to the catalog; the AI writes the missing explanation and draws its image",
  request: { body: json(VirtueInputSchema) },
  responses: { 201: virtueResponse, ...errors, 409: errorResponse("A virtue with that name already exists") },
});

export const updateVirtueRoute = createRoute({
  method: "patch",
  path: "/virtues/{id}",
  tags,
  security,
  summary: "Rename a virtue or edit its explanation",
  request: { params: IdParam, body: json(VirtueInputSchema) },
  responses: { 200: virtueResponse, ...errors, 409: errorResponse("A virtue with that name already exists") },
});

export const deleteVirtueRoute = createRoute({
  method: "delete",
  path: "/virtues/{id}",
  tags,
  security,
  summary: "Delete a virtue that no activity uses",
  request: { params: IdParam },
  responses: { 204: { description: "Virtue deleted" }, ...errors, 409: errorResponse("The virtue is assigned to activities") },
});

export const replaceVirtueImageRoute = createRoute({
  method: "put",
  path: "/virtues/{id}/image",
  tags,
  security,
  summary: "Replace the reflection image of a virtue with an uploaded one",
  request: { params: IdParam, body: { content: { "multipart/form-data": { schema: ImageUploadSchema } } } },
  responses: { 200: virtueResponse, ...errors, 400: errorResponse("Invalid or too large image") },
});

export const regenerateVirtueImageRoute = createRoute({
  method: "post",
  path: "/virtues/{id}/image/regenerate",
  tags,
  security,
  summary: "Ask the AI to draw a new reflection image for a virtue",
  request: { params: IdParam },
  responses: { 202: { description: "Image generation queued" }, ...errors },
});

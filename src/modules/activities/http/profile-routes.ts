import { createRoute, z } from "@hono/zod-openapi";
import { errorResponse } from "@/server/http/error-schema";
import { IdParam } from "./activity-schemas";
import { ActivityVirtueParams, ImageUploadSchema, ProfileSchema, ProfileTextsSchema, ProfileVirtuesSchema, RegenerateProfileSchema } from "./profile-schemas";

const tags = ["Pastoral profile"];
const security = [{ session: [] }];
const json = <T extends z.ZodType>(schema: T) => ({ content: { "application/json": { schema } } });
const profileResponse = { 200: { description: "Pastoral profile", ...json(ProfileSchema) } };
const errors = {
  401: errorResponse("No active session"),
  403: errorResponse("Cannot edit this activity"),
  404: errorResponse("Activity not found"),
};

export const getProfileRoute = createRoute({
  method: "get",
  path: "/activities/{id}/profile",
  tags,
  security,
  summary: "Get the pastoral profile of an activity: description, virtues, coexistence impact and reflection image",
  request: { params: IdParam },
  responses: { ...profileResponse, ...errors },
});

export const updateProfileTextsRoute = createRoute({
  method: "patch",
  path: "/activities/{id}/profile",
  tags,
  security,
  summary: "Edit the pastoral description or coexistence impact",
  description: "Edited fields are marked as manual and the AI no longer overwrites them.",
  request: { params: IdParam, body: json(ProfileTextsSchema) },
  responses: { ...profileResponse, ...errors },
});

export const setProfileVirtuesRoute = createRoute({
  method: "put",
  path: "/activities/{id}/profile/virtues",
  tags,
  security,
  summary: "Replace the virtues an activity promotes (3 to 5), each with an optional explanation for this activity",
  description:
    "Names are matched against the shared catalog ignoring accents and case; new names are added to it. The same virtue can be explained differently in each activity: `explanation` is stored for this activity only and, when empty, the catalog explanation is shown.",
  request: { params: IdParam, body: json(ProfileVirtuesSchema) },
  responses: { ...profileResponse, ...errors, 400: errorResponse("Fewer than 3 or more than 5 different virtues") },
});

export const replaceProfileImageRoute = createRoute({
  method: "put",
  path: "/activities/{id}/profile/image",
  tags,
  security,
  summary: "Replace the reflection image with an uploaded one",
  request: { params: IdParam, body: { content: { "multipart/form-data": { schema: ImageUploadSchema } } } },
  responses: { ...profileResponse, ...errors, 400: errorResponse("Invalid or too large image") },
});

export const regenerateProfileRoute = createRoute({
  method: "post",
  path: "/activities/{id}/profile/regenerate",
  tags,
  security,
  summary: "Ask the AI to generate the chosen fields again",
  description: "The chosen fields stop being manual. Generation runs in the background; poll the profile status.",
  request: { params: IdParam, body: json(RegenerateProfileSchema) },
  responses: { 202: { description: "Regeneration queued", ...json(ProfileSchema) }, ...errors },
});

const virtueErrors = { ...errors, 404: errorResponse("Activity not found or the virtue is not assigned to it") };

export const replaceVirtueImageForActivityRoute = createRoute({
  method: "put",
  path: "/activities/{id}/profile/virtues/{virtueId}/image",
  tags,
  security,
  summary: "Give a virtue its own image in this activity, from an uploaded file",
  description: "Other activities keep showing the catalog image of the virtue, or their own.",
  request: { params: ActivityVirtueParams, body: { content: { "multipart/form-data": { schema: ImageUploadSchema } } } },
  responses: { ...profileResponse, ...virtueErrors, 400: errorResponse("Invalid or too large image") },
});

export const regenerateVirtueImageForActivityRoute = createRoute({
  method: "post",
  path: "/activities/{id}/profile/virtues/{virtueId}/image/regenerate",
  tags,
  security,
  summary: "Ask the AI to draw an image of how this activity lives the virtue",
  description: "Uses the activity, its pastoral description and the virtue explanation for this activity. Runs in the background.",
  request: { params: ActivityVirtueParams },
  responses: { 202: { description: "Image generation queued" }, ...virtueErrors },
});

export const resetVirtueImageForActivityRoute = createRoute({
  method: "delete",
  path: "/activities/{id}/profile/virtues/{virtueId}/image",
  tags,
  security,
  summary: "Remove the image of a virtue made for this activity and show the catalog image again",
  request: { params: ActivityVirtueParams },
  responses: { ...profileResponse, ...virtueErrors },
});

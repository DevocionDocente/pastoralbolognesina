import { createRoute, z } from "@hono/zod-openapi";
import { errorResponse } from "@/server/http/error-schema";
import {
  ActivityDetailSchema,
  ActivityInputSchema,
  ActivityListQuery,
  ActivitySchema,
  IdParam,
  PublicationSchema,
  SeriesSchema,
} from "./activity-schemas";

const tags = ["Activities"];
const security = [{ session: [] }];
const json = <T extends z.ZodType>(schema: T) => ({ content: { "application/json": { schema } } });
const activityResponse = { description: "Activity", ...json(ActivitySchema) };
const errors = {
  401: errorResponse("No active session"),
  403: errorResponse("Missing activity permission"),
};
const notFound = { 404: errorResponse("Activity not found") };
const invalid = { 400: errorResponse("Invalid date or year") };

export const listActivitiesRoute = createRoute({
  method: "get",
  path: "/activities",
  tags,
  security,
  summary: "List activities, newest year first, optionally filtered by name",
  request: { query: ActivityListQuery },
  responses: { 200: { description: "Activities", ...json(z.array(ActivitySchema)) }, ...errors },
});

export const getActivityRoute = createRoute({
  method: "get",
  path: "/activities/{id}",
  tags,
  security,
  summary: "Get an activity and what the current user can do with it",
  request: { params: IdParam },
  responses: { 200: { description: "Activity", ...json(ActivityDetailSchema) }, ...errors, ...notFound },
});

export const createActivityRoute = createRoute({
  method: "post",
  path: "/activities",
  tags,
  security,
  summary: "Create an activity; the series is created when the name is new",
  request: { body: json(ActivityInputSchema) },
  responses: { 201: activityResponse, ...errors, ...invalid },
});

export const updateActivityRoute = createRoute({
  method: "put",
  path: "/activities/{id}",
  tags,
  security,
  summary: "Update an activity",
  request: { params: IdParam, body: json(ActivityInputSchema) },
  responses: { 200: activityResponse, ...errors, ...notFound, ...invalid },
});

export const publishActivityRoute = createRoute({
  method: "patch",
  path: "/activities/{id}/publication",
  tags,
  security,
  summary: "Publish or hide an activity from the public gallery",
  request: { params: IdParam, body: json(PublicationSchema) },
  responses: { 200: activityResponse, ...errors, ...notFound },
});

export const deleteActivityRoute = createRoute({
  method: "delete",
  path: "/activities/{id}",
  tags,
  security,
  summary: "Delete an activity and all of its files",
  request: { params: IdParam },
  responses: { 204: { description: "Activity deleted" }, ...errors, ...notFound },
});

export const listSeriesRoute = createRoute({
  method: "get",
  path: "/activity-series",
  tags,
  security,
  summary: "List recurring activities such as Semana Santa",
  responses: { 200: { description: "Series", ...json(z.array(SeriesSchema)) }, ...errors },
});

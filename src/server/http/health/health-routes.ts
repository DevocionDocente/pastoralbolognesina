import { createRoute, z } from "@hono/zod-openapi";

export const HealthSchema = z
  .object({
    status: z.literal("ok"),
    timestamp: z.iso.datetime().openapi({ example: "2026-09-26T12:00:00.000Z" }),
  })
  .openapi("Health");

export const getHealthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["System"],
  summary: "Check that the API is running",
  responses: {
    200: { description: "API is healthy", content: { "application/json": { schema: HealthSchema } } },
  },
});

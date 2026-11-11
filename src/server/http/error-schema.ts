import { z } from "@hono/zod-openapi";

export const ErrorSchema = z
  .object({
    code: z.string().openapi({ example: "NOT_FOUND" }),
    message: z.string().openapi({ example: "Resource not found" }),
  })
  .openapi("Error");

export const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: ErrorSchema } },
});

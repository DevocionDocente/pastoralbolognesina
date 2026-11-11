import { createRoute, z } from "@hono/zod-openapi";
import { errorResponse } from "@/server/http/error-schema";
import { USER_STATUSES } from "../domain/access";
import { PERMISSIONS } from "../domain/permissions";

export const ProfileSchema = z
  .object({
    id: z.string().openapi({ example: "b1c2d3" }),
    name: z.string().openapi({ example: "Administrador" }),
    email: z.email().openapi({ example: "admin@pastoralbolognesina.com" }),
    status: z.enum(USER_STATUSES).openapi({ example: "active" }),
    role: z
      .object({ id: z.uuid(), name: z.string().openapi({ example: "Administrador" }) })
      .nullable(),
    permissions: z.array(z.enum(PERMISSIONS)),
  })
  .openapi("Profile");

export const getProfileRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Session"],
  summary: "Get the signed-in user with role and permissions",
  security: [{ session: [] }],
  responses: {
    200: { description: "Current user", content: { "application/json": { schema: ProfileSchema } } },
    401: errorResponse("No active session"),
  },
});

import { createRoute, z } from "@hono/zod-openapi";
import { errorResponse } from "@/server/http/error-schema";
import { PermissionSchema, RoleIdParam, RoleInputSchema, RoleSchema } from "./role-schemas";

const tags = ["Roles"];
const security = [{ session: [] }];
const json = <T extends z.ZodType>(schema: T) => ({ content: { "application/json": { schema } } });
const roleResponse = { description: "Role", ...json(RoleSchema) };
const unauthorized = { 401: errorResponse("No active session") };
const forbidden = { 403: errorResponse("Missing roles.manage permission") };
const notFound = { 404: errorResponse("Role not found") };

export const listPermissionsRoute = createRoute({
  method: "get",
  path: "/permissions",
  tags,
  security,
  summary: "List the permission catalog with Spanish labels",
  responses: { 200: { description: "Permissions", ...json(z.array(PermissionSchema)) }, ...unauthorized },
});

export const listRolesRoute = createRoute({
  method: "get",
  path: "/roles",
  tags,
  security,
  summary: "List roles with their permissions and number of users",
  responses: {
    200: { description: "Roles", ...json(z.array(RoleSchema)) },
    ...unauthorized,
    403: errorResponse("Missing users.manage permission"),
  },
});

export const createRoleRoute = createRoute({
  method: "post",
  path: "/roles",
  tags,
  security,
  summary: "Create a role with a set of permissions",
  request: { body: json(RoleInputSchema) },
  responses: { 201: roleResponse, ...unauthorized, ...forbidden, 409: errorResponse("Role name already exists") },
});

export const updateRoleRoute = createRoute({
  method: "put",
  path: "/roles/{id}",
  tags,
  security,
  summary: "Update a role's name, description and permissions",
  request: { params: RoleIdParam, body: json(RoleInputSchema) },
  responses: {
    200: roleResponse,
    ...unauthorized,
    ...forbidden,
    ...notFound,
    400: errorResponse("Administrator role or system role name cannot change"),
    409: errorResponse("Role name already exists"),
  },
});

export const deleteRoleRoute = createRoute({
  method: "delete",
  path: "/roles/{id}",
  tags,
  security,
  summary: "Delete a custom role without assigned users",
  request: { params: RoleIdParam },
  responses: {
    204: { description: "Role deleted" },
    ...unauthorized,
    ...forbidden,
    ...notFound,
    400: errorResponse("System roles cannot be deleted"),
    409: errorResponse("The role still has assigned users"),
  },
});

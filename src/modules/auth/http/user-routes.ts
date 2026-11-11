import { createRoute, z } from "@hono/zod-openapi";
import { errorResponse } from "@/server/http/error-schema";
import {
  AccessRecordSchema,
  CreateUserSchema,
  GrantAccessSchema,
  ResetPasswordSchema,
  SetUserPermissionsSchema,
  UserPermissionsSchema,
  RevokeAccessSchema,
  UpdateUserSchema,
  UserIdParam,
  UserListQuery,
  UserSchema,
} from "./user-schemas";

const tags = ["Users"];
const security = [{ session: [] }];
const json = <T extends z.ZodType>(schema: T) => ({ content: { "application/json": { schema } } });
const userResponse = { description: "User", ...json(UserSchema) };
const commonErrors = {
  401: errorResponse("No active session"),
  403: errorResponse("Missing users.access or users.manage permission"),
};
const notFound = { 404: errorResponse("User or role not found") };

export const listUsersRoute = createRoute({
  method: "get",
  path: "/users",
  tags,
  security,
  summary: "List users, optionally filtered by status",
  request: { query: UserListQuery },
  responses: { 200: { description: "Users", ...json(z.array(UserSchema)) }, ...commonErrors },
});

export const createUserRoute = createRoute({
  method: "post",
  path: "/users",
  tags,
  security,
  summary: "Create an active user with a role",
  request: { body: json(CreateUserSchema) },
  responses: {
    201: userResponse,
    ...commonErrors,
    ...notFound,
    409: errorResponse("Email already registered"),
  },
});

export const updateUserRoute = createRoute({
  method: "patch",
  path: "/users/{id}",
  tags,
  security,
  summary: "Update a user's name and email",
  request: { params: UserIdParam, body: json(UpdateUserSchema) },
  responses: { 200: userResponse, ...commonErrors, ...notFound, 409: errorResponse("Email already registered") },
});

export const grantAccessRoute = createRoute({
  method: "post",
  path: "/users/{id}/grant",
  tags,
  security,
  summary: "Approve a pending user, restore a revoked user or change an active user's role",
  request: { params: UserIdParam, body: json(GrantAccessSchema) },
  responses: { 200: userResponse, ...commonErrors, ...notFound, 400: errorResponse("Invalid operation") },
});

export const revokeAccessRoute = createRoute({
  method: "post",
  path: "/users/{id}/revoke",
  tags,
  security,
  summary: "Revoke access with a reason; the person keeps only the public website",
  request: { params: UserIdParam, body: json(RevokeAccessSchema) },
  responses: { 200: userResponse, ...commonErrors, ...notFound, 400: errorResponse("User is not active") },
});

export const rejectUserRoute = createRoute({
  method: "delete",
  path: "/users/{id}",
  tags,
  security,
  summary: "Reject a pending sign-up request and delete the account",
  request: { params: UserIdParam },
  responses: { 204: { description: "Request rejected" }, ...commonErrors, ...notFound, 400: errorResponse("User is not pending") },
});

export const resetPasswordRoute = createRoute({
  method: "post",
  path: "/users/{id}/password",
  tags,
  security,
  summary: "Set a new password for a user and close their sessions",
  request: { params: UserIdParam, body: json(ResetPasswordSchema) },
  responses: { 204: { description: "Password updated" }, ...commonErrors, ...notFound },
});

export const accessHistoryRoute = createRoute({
  method: "get",
  path: "/users/{id}/access-history",
  tags,
  security,
  summary: "List access grants and revocations of a user",
  request: { params: UserIdParam },
  responses: { 200: { description: "Access history", ...json(z.array(AccessRecordSchema)) }, ...commonErrors, ...notFound },
});

export const getUserPermissionsRoute = createRoute({
  method: "get",
  path: "/users/{id}/permissions",
  tags,
  security,
  summary: "Get a user's permissions: those of the role, individual overrides and the effective result",
  request: { params: UserIdParam },
  responses: {
    200: { description: "User permissions", ...json(UserPermissionsSchema) },
    ...commonErrors,
    ...notFound,
    400: errorResponse("User is not active"),
  },
});

export const setUserPermissionsRoute = createRoute({
  method: "put",
  path: "/users/{id}/permissions",
  tags,
  security,
  summary: "Adjust one user's permissions without changing their role",
  description:
    "Send the full list the user should have. Permissions missing from the role are added individually and role permissions left out are removed only for this user. Changes are written to the access history. Requires users.manage; nobody can change their own permissions.",
  request: { params: UserIdParam, body: json(SetUserPermissionsSchema) },
  responses: {
    200: { description: "Updated permissions", ...json(UserPermissionsSchema) },
    ...commonErrors,
    ...notFound,
    400: errorResponse("User is not active or is the current user"),
  },
});

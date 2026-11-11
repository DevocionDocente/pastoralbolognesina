import { z } from "@hono/zod-openapi";
import { ACCESS_ACTIONS, REVOCATION_REASONS, USER_STATUSES } from "../domain/access";
import { PERMISSIONS } from "../domain/permissions";

export const UserIdParam = z.object({
  id: z.string().openapi({ param: { name: "id", in: "path" }, example: "Z0jlX1Tf1eLvczTk" }),
});

export const RoleRefSchema = z
  .object({ id: z.uuid(), name: z.string().openapi({ example: "Equipo pastoral" }) })
  .openapi("RoleRef");

export const UserSchema = z
  .object({
    id: z.string().openapi({ example: "Z0jlX1Tf1eLvczTk" }),
    name: z.string().openapi({ example: "María Pérez" }),
    email: z.email().openapi({ example: "maria.perez@colegio.edu.pe" }),
    status: z.enum(USER_STATUSES).openapi({ example: "active" }),
    role: RoleRefSchema.nullable(),
    createdAt: z.iso.datetime(),
  })
  .openapi("User");

export const UserListQuery = z.object({
  status: z.enum(USER_STATUSES).optional().openapi({ param: { name: "status", in: "query" } }),
});

const password = z.string().min(8).openapi({ example: "Temporal-2026" });

export const CreateUserSchema = z
  .object({
    name: z.string().trim().min(1).openapi({ example: "María Pérez" }),
    email: z.email().openapi({ example: "maria.perez@colegio.edu.pe" }),
    password,
    roleId: z.uuid(),
  })
  .openapi("CreateUser");

export const UpdateUserSchema = z
  .object({
    name: z.string().trim().min(1).openapi({ example: "María Pérez" }),
    email: z.email().openapi({ example: "maria.perez@colegio.edu.pe" }),
  })
  .openapi("UpdateUser");

export const GrantAccessSchema = z.object({ roleId: z.uuid() }).openapi("GrantAccess");

export const RevokeAccessSchema = z
  .object({
    reason: z.enum(REVOCATION_REASONS).openapi({ example: "cessation" }),
    note: z.string().trim().max(500).nullable().default(null).openapi({ example: "Fin del año escolar" }),
  })
  .openapi("RevokeAccess");

export const ResetPasswordSchema = z.object({ password }).openapi("ResetPassword");

export const AccessRecordSchema = z
  .object({
    id: z.uuid(),
    action: z.enum(ACCESS_ACTIONS),
    roleName: z.string().nullable(),
    reason: z.enum(REVOCATION_REASONS).nullable(),
    note: z.string().nullable(),
    addedPermissions: z.array(z.enum(PERMISSIONS)).openapi({ description: "Permissions given individually in a permissions_changed entry" }),
    removedPermissions: z.array(z.enum(PERMISSIONS)).openapi({ description: "Permissions taken away individually in a permissions_changed entry" }),
    performedByName: z.string().nullable(),
    createdAt: z.iso.datetime(),
  })
  .openapi("AccessRecord");

const permissionList = z.array(z.enum(PERMISSIONS));

export const PermissionOverrideSchema = z
  .object({
    permission: z.enum(PERMISSIONS),
    granted: z.boolean().openapi({ description: "true: added on top of the role; false: removed from the role" }),
  })
  .openapi("PermissionOverride");

export const UserPermissionsSchema = z
  .object({
    rolePermissions: permissionList.openapi({ description: "Permissions that come from the user's role" }),
    overrides: z.array(PermissionOverrideSchema),
    effective: permissionList.openapi({ description: "Permissions the user actually has", example: ["activities.create", "media.edit"] }),
  })
  .openapi("UserPermissions");

export const SetUserPermissionsSchema = z
  .object({
    permissions: permissionList.openapi({
      description: "Complete list of permissions the user should have; differences with the role are stored as individual overrides",
      example: ["activities.create", "activities.update_own", "media.edit", "profiles.edit"],
    }),
  })
  .openapi("SetUserPermissions");

export type UserDto = z.infer<typeof UserSchema>;
export type UserPermissionsDto = z.infer<typeof UserPermissionsSchema>;
export type AccessRecordDto = z.infer<typeof AccessRecordSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type RevokeAccessInput = z.input<typeof RevokeAccessSchema>;

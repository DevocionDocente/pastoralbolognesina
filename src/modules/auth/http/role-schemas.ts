import { z } from "@hono/zod-openapi";
import { PERMISSIONS } from "../domain/permissions";

export const RoleIdParam = z.object({
  id: z.uuid().openapi({ param: { name: "id", in: "path" } }),
});

export const RoleSchema = z
  .object({
    id: z.uuid(),
    name: z.string().openapi({ example: "Equipo pastoral" }),
    description: z.string().nullable().openapi({ example: "Registra actividades y edita las propias." }),
    isSystem: z.boolean(),
    permissions: z.array(z.enum(PERMISSIONS)),
    userCount: z.number().int(),
  })
  .openapi("Role");

export const RoleInputSchema = z
  .object({
    name: z.string().trim().min(1).max(60).openapi({ example: "Coordinador de pastoral" }),
    description: z.string().trim().max(200).nullable().default(null),
    permissions: z.array(z.enum(PERMISSIONS)).openapi({ example: ["activities.create", "activities.update_own", "media.upload"] }),
  })
  .openapi("RoleInput");

export const PermissionSchema = z
  .object({
    key: z.enum(PERMISSIONS),
    label: z.string().openapi({ example: "Registrar actividades y subir evidencias" }),
  })
  .openapi("Permission");

export type RoleDto = z.infer<typeof RoleSchema>;
export type RoleInputDto = z.input<typeof RoleInputSchema>;
export type PermissionDto = z.infer<typeof PermissionSchema>;

import { PERMISSIONS, type Permission } from "./permissions";

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: readonly Permission[];
}

export const ADMINISTRATOR_ROLE: RoleDefinition = {
  name: "Administrador",
  description: "Gestiona usuarios, roles y todas las actividades pastorales.",
  permissions: PERMISSIONS,
};

export const PASTORAL_TEAM_ROLE: RoleDefinition = {
  name: "Equipo pastoral",
  description: "Integrantes del equipo pastoral y directivos: registran actividades y suben sus evidencias.",
  permissions: ["activities.create", "activities.update_own", "media.upload", "media.edit", "profiles.edit"],
};

export const DEFAULT_ROLES = [ADMINISTRATOR_ROLE, PASTORAL_TEAM_ROLE];

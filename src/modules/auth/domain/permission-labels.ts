import type { Permission } from "./permissions";

export const PERMISSION_LABELS: Record<Permission, string> = {
  "activities.create": "Registrar actividades",
  "activities.update_own": "Editar y publicar sus propias actividades",
  "activities.update_any": "Editar y publicar cualquier actividad",
  "activities.delete": "Eliminar actividades",
  "media.upload": "Subir archivos y enlaces de YouTube",
  "media.edit": "Editar los datos y el tipo de los archivos",
  "media.delete": "Eliminar cualquier archivo",
  "profiles.edit": "Editar el perfil pastoral",
  "virtues.manage": "Editar el catálogo de virtudes",
  "users.access": "Aprobar y retirar accesos",
  "users.manage": "Crear usuarios y ajustar sus permisos",
  "roles.manage": "Crear roles y asignar permisos",
};

export const PERMISSION_GROUPS: { title: string; permissions: Permission[] }[] = [
  { title: "Actividades", permissions: ["activities.create", "activities.update_own", "activities.update_any", "activities.delete"] },
  { title: "Archivos", permissions: ["media.upload", "media.edit", "media.delete"] },
  { title: "Perfil pastoral", permissions: ["profiles.edit", "virtues.manage"] },
  { title: "Administración", permissions: ["users.access", "users.manage", "roles.manage"] },
];

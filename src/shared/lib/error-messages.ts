import { ApiError } from "./api-client";

const MESSAGES: Record<string, string> = {
  "Email already registered": "Ya existe una cuenta con ese correo.",
  "You cannot revoke your own access": "No puedes retirar tu propio acceso.",
  "You cannot change your own access": "No puedes cambiar tu propio acceso.",
  "User must be active": "Esa persona no tiene acceso activo. Apruébala o restitúyele el acceso primero.",
  "A role with that name already exists": "Ya existe un rol con ese nombre.",
  "The administrator role cannot be edited": "El rol Administrador no se puede modificar.",
  "System roles cannot be renamed": "Los roles del sistema no se pueden renombrar.",
  "System roles cannot be deleted": "Los roles del sistema no se pueden eliminar.",
  "The role still has assigned users": "El rol todavía tiene usuarios asignados.",
  "Unsupported file type": "Ese tipo de archivo no está permitido.",
  "File is too large": "El archivo supera el tamaño permitido (50 MB para fotos y documentos, 4 GB para videos).",
  "Invalid YouTube URL": "El enlace de YouTube no es válido.",
  "A date or a year is required": "Indica la fecha de la actividad o, si no la conoces, el año.",
  "Year is out of range": "El año indicado no es válido.",
  "An activity needs between 3 and 5 different virtues": "Elige entre 3 y 5 virtudes distintas.",
  "The file is not a valid image": "El archivo no es una imagen válida.",
  "A virtue with that name already exists": "Ya existe una virtud con ese nombre.",
  "Virtue is assigned to activities": "La virtud está asignada a actividades; quítala de ellas antes de eliminarla.",
};

const BY_STATUS: Record<number, string> = {
  401: "Tu sesión expiró. Vuelve a iniciar sesión.",
  403: "No tienes permiso para realizar esta acción.",
  404: "El registro ya no existe.",
};

export function friendlyError(error: unknown): string {
  if (!(error instanceof ApiError)) return "Se perdió la conexión o el servidor no respondió. Inténtalo de nuevo.";
  return MESSAGES[error.message] ?? BY_STATUS[error.status] ?? "No se pudo completar la acción.";
}

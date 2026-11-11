import type { MediaCategory } from "../domain/media-category";
import type { ProfileField } from "../domain/pastoral-profile";

export const CATEGORY_LABELS: Record<MediaCategory, string> = {
  image: "Imagen",
  video: "Video",
  pastoral_plan: "Plan Pastoral",
  meeting_agreements: "Acuerdos de Reunión",
  activity_work_plan: "Esquema de Trabajo por Actividades",
  financial_report: "Balance Económico",
  report: "Informe",
  other: "Otro",
};

export const PROFILE_FIELD_LABELS: Record<ProfileField, string> = {
  pastoralDescription: "Descripción pastoral",
  coexistenceImpact: "Impacto en la convivencia",
  virtues: "Virtudes",
  reflectionImage: "Imagen de reflexión",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

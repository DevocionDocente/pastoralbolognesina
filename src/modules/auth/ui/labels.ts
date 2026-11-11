import type { RevocationReason, UserStatus } from "../domain/access";

export const STATUS_LABELS: Record<UserStatus, string> = {
  pending: "Pendiente",
  active: "Activo",
  revoked: "Sin acceso",
};

export const REASON_LABELS: Record<RevocationReason, string> = {
  cessation: "Cese",
  reassignment: "Reasignación",
  contract_end: "Conclusión del contrato",
  other: "Otro motivo",
};

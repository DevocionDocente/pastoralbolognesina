export const USER_STATUSES = ["pending", "active", "revoked"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const REVOCATION_REASONS = ["cessation", "reassignment", "contract_end", "other"] as const;
export type RevocationReason = (typeof REVOCATION_REASONS)[number];

export const ACCESS_ACTIONS = ["granted", "revoked", "permissions_changed"] as const;
export type AccessAction = (typeof ACCESS_ACTIONS)[number];

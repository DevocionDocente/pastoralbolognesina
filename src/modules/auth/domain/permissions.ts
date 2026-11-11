export const PERMISSIONS = [
  "activities.create",
  "activities.update_own",
  "activities.update_any",
  "activities.delete",
  "media.upload",
  "media.edit",
  "media.delete",
  "profiles.edit",
  "virtues.manage",
  "users.access",
  "users.manage",
  "roles.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const CONTENT_PERMISSIONS: readonly Permission[] = [
  "activities.create",
  "activities.update_own",
  "activities.update_any",
  "activities.delete",
  "media.upload",
  "media.edit",
  "media.delete",
  "profiles.edit",
];

export const USER_ADMINISTRATION_PERMISSIONS: readonly Permission[] = ["users.access", "users.manage"];

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}

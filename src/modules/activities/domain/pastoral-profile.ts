export const MIN_VIRTUES = 3;
export const MAX_VIRTUES = 5;

export const PROFILE_FIELDS = ["pastoralDescription", "coexistenceImpact", "virtues", "reflectionImage"] as const;
export type ProfileField = (typeof PROFILE_FIELDS)[number];

export interface Virtue {
  id: string;
  name: string;
  explanation: string;
  imageKey: string | null;
}

export interface ActivityVirtue extends Virtue {
  ownExplanation: string | null;
  ownImageKey: string | null;
}

export interface VirtueAssignment {
  virtueId: string;
  explanation: string | null;
}

export interface ActivityProfile {
  activityId: string;
  pastoralDescription: string | null;
  coexistenceImpact: string | null;
  reflectionImageKey: string | null;
  manualFields: ProfileField[];
  status: "pending" | "processing" | "ready" | "error";
  virtues: ActivityVirtue[];
}

export function normalizeVirtueName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanVirtueName(name: string): string {
  const trimmed = name.replace(/\s+/g, " ").trim();
  return trimmed.charAt(0).toLocaleUpperCase("es") + trimmed.slice(1);
}

export function isProfileField(value: string): value is ProfileField {
  return (PROFILE_FIELDS as readonly string[]).includes(value);
}

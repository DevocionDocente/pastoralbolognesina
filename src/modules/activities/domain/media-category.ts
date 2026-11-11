import type { MediaKind } from "./media-kind";

export const MEDIA_CATEGORIES = [
  "image",
  "video",
  "pastoral_plan",
  "meeting_agreements",
  "activity_work_plan",
  "financial_report",
  "report",
  "other",
] as const;

export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

export function defaultCategoryFor(kind: MediaKind): MediaCategory {
  if (kind === "photo") return "image";
  if (kind === "video" || kind === "youtube") return "video";
  return "other";
}

export function isMediaCategory(value: string): value is MediaCategory {
  return (MEDIA_CATEGORIES as readonly string[]).includes(value);
}

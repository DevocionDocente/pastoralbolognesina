import type { MediaCategory } from "./media-category";
import type { MediaKind } from "./media-kind";

export interface Series {
  id: string;
  name: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  year: number;
  series: Series | null;
  published: boolean;
  aiSummary: string | null;
  createdBy: { id: string; name: string } | null;
  mediaCount: number;
  createdAt: Date;
}

export interface MediaItem {
  id: string;
  activityId: string;
  kind: MediaKind;
  storageKey: string | null;
  thumbnailKey: string | null;
  youtubeId: string | null;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  title: string | null;
  description: string | null;
  analysisStatus: "pending" | "processing" | "ready" | "error";
  analysisError: string | null;
  category: MediaCategory | null;
  categorySource: "ai" | "manual" | null;
  uploadedBy: string | null;
  createdAt: Date;
}

export interface ActivityInput {
  name: string;
  description: string | null;
  date: string | null;
  year: number | null;
  seriesName: string | null;
}

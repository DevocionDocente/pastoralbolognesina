import type { MediaItem } from "./activity";

export interface Moment {
  second: number;
  text: string;
}

export interface AnalysisResult {
  description: string;
  tags: string[];
  transcript: string | null;
  extractedText: string | null;
  moments: Moment[];
  thumbnail: Buffer | null;
}

export interface MediaAnalysis {
  mediaId: string;
  description: string;
  tags: string[];
  transcript: string | null;
  extractedText: string | null;
  moments: Moment[];
  model: string;
  updatedAt: Date;
}

export interface MediaContext {
  media: MediaItem;
  activity: { id: string; name: string; description: string | null; year: number; seriesName: string | null };
}

export function contextLine({ media, activity }: MediaContext): string {
  const series = activity.seriesName ? `, parte de "${activity.seriesName}"` : "";
  return `Actividad pastoral "${activity.name}" (${activity.year}${series}). Archivo: ${media.title ?? media.originalName}.`;
}

export function activityContext(activity: MediaContext["activity"]): string {
  return [
    `Actividad pastoral "${activity.name}" (${activity.year})`,
    activity.seriesName ? `Actividad recurrente: ${activity.seriesName}` : null,
    activity.description ? `Descripción del equipo: ${activity.description}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export class AnalysisUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisUnavailableError";
  }
}

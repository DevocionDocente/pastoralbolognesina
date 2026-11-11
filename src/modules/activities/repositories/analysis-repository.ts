import type { MediaItem } from "../domain/activity";
import type { AnalysisResult, MediaAnalysis, MediaContext } from "../domain/analysis";
import type { TextChunk } from "../domain/text-chunks";

export interface EmbeddedChunk extends TextChunk {
  embedding: number[];
}

export interface ActivityAnalyses {
  activity: MediaContext["activity"];
  summary: string | null;
  items: { name: string; description: string }[];
}

export interface AnalysisRepository {
  findContext(mediaId: string): Promise<MediaContext | null>;
  setStatus(mediaId: string, status: MediaItem["analysisStatus"], error?: string | null): Promise<void>;
  listInterrupted(): Promise<Pick<MediaItem, "id" | "kind">[]>;
  setThumbnail(mediaId: string, key: string): Promise<void>;
  save(context: MediaContext, result: AnalysisResult, model: string, chunks: EmbeddedChunk[]): Promise<void>;
  findAnalysis(mediaId: string): Promise<MediaAnalysis | null>;
  activityAnalyses(activityId: string): Promise<ActivityAnalyses | null>;
  saveActivitySummary(activityId: string, summary: string | null): Promise<void>;
}

import type { Activity, MediaItem } from "../domain/activity";
import { defaultCategoryFor } from "../domain/media-category";
import type { AnalysisDetails } from "../services/analysis-status-service";
import type { MediaUrls } from "../services/media-url-resolver";
import type { ActivityDto, AnalysisDto, MediaDto } from "./activity-schemas";

const MAX_TEXT_PREVIEW = 20_000;

export function toActivityDto(activity: Activity): ActivityDto {
  return { ...activity, createdAt: activity.createdAt.toISOString() };
}

export function toMediaDto(item: MediaItem, urls: MediaUrls): MediaDto {
  return {
    id: item.id,
    kind: item.kind,
    originalName: item.originalName,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    title: item.title,
    description: item.description,
    youtubeId: item.youtubeId,
    analysisStatus: item.analysisStatus,
    analysisError: item.analysisError,
    category: item.category ?? defaultCategoryFor(item.kind),
    categorySource: item.categorySource ?? "default",
    ...urls,
    createdAt: item.createdAt.toISOString(),
  };
}

export function toAnalysisDto({ media, error, analysis }: AnalysisDetails): AnalysisDto {
  return {
    status: media.analysisStatus,
    error,
    description: analysis?.description ?? null,
    tags: analysis?.tags ?? [],
    transcript: analysis?.transcript?.slice(0, MAX_TEXT_PREVIEW) ?? null,
    extractedText: analysis?.extractedText?.slice(0, MAX_TEXT_PREVIEW) ?? null,
    moments: analysis?.moments ?? [],
    model: analysis?.model ?? null,
    updatedAt: analysis?.updatedAt.toISOString() ?? null,
  };
}

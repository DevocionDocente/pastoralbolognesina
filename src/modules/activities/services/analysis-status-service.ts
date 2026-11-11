import { NotFoundError } from "@/shared/domain/domain-error";
import type { MediaItem } from "../domain/activity";
import type { MediaAnalysis } from "../domain/analysis";
import type { AnalysisRepository } from "../repositories/analysis-repository";
import type { MediaRepository } from "../repositories/media-repository";
import type { ActivityGuard } from "./activity-guard";
import type { AnalysisQueue } from "./analysis-queue";

export interface AnalysisDetails {
  media: MediaItem;
  error: string | null;
  analysis: MediaAnalysis | null;
}

export class AnalysisStatusService {
  constructor(
    private readonly guard: ActivityGuard,
    private readonly media: MediaRepository,
    private readonly analyses: AnalysisRepository,
    private readonly queue: AnalysisQueue,
  ) {}

  async details(actorId: string, mediaId: string): Promise<AnalysisDetails> {
    await this.guard.ensureCanView(actorId);
    const context = await this.analyses.findContext(mediaId);
    if (!context) throw new NotFoundError("Media not found");
    const analysis = await this.analyses.findAnalysis(mediaId);
    return { media: context.media, error: context.media.analysisError, analysis };
  }

  async retry(actorId: string, mediaId: string): Promise<MediaItem> {
    await this.guard.ensure(actorId, "media.edit");
    const media = await this.media.findById(mediaId);
    if (!media) throw new NotFoundError("Media not found");
    await this.analyses.setStatus(mediaId, "pending");
    await this.queue.enqueueMedia(mediaId, media.kind);
    return (await this.media.findById(mediaId))!;
  }
}

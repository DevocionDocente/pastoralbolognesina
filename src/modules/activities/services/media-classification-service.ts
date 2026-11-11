import type { AnalysisRepository } from "../repositories/analysis-repository";
import type { MediaRepository } from "../repositories/media-repository";
import type { AiClient } from "./ai-client";
import type { AnalysisQueue } from "./analysis-queue";

const EXCERPT_LENGTH = 1500;

export class MediaClassificationService {
  constructor(
    private readonly analyses: AnalysisRepository,
    private readonly media: MediaRepository,
    private readonly ai: AiClient,
    private readonly queue: AnalysisQueue,
  ) {}

  async classify(mediaId: string): Promise<void> {
    const context = await this.analyses.findContext(mediaId);
    const analysis = await this.analyses.findAnalysis(mediaId);
    if (!context || !analysis || context.media.categorySource === "manual") return;
    const category = await this.ai.classify({
      kind: context.media.kind,
      name: context.media.originalName,
      description: [analysis.description, analysis.extractedText?.slice(0, EXCERPT_LENGTH)].filter(Boolean).join("\n"),
    });
    await this.media.setCategory(mediaId, category, "ai");
  }

  async recoverUncategorized(): Promise<number> {
    const pending = await this.media.listUncategorized();
    for (const mediaId of pending) await this.queue.enqueueClassification(mediaId);
    return pending.length;
  }
}

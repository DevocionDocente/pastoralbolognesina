import { activityContext } from "../domain/analysis";
import type { AnalysisRepository } from "../repositories/analysis-repository";
import type { AiClient } from "./ai-client";
import type { AnalysisQueue } from "./analysis-queue";

const MAX_ITEMS = 60;

export class ActivitySummaryService {
  constructor(
    private readonly analyses: AnalysisRepository,
    private readonly ai: AiClient,
    private readonly queue: AnalysisQueue,
  ) {}

  async summarize(activityId: string): Promise<void> {
    const material = await this.analyses.activityAnalyses(activityId);
    if (!material) return;
    if (material.items.length === 0) return this.analyses.saveActivitySummary(activityId, null);
    const summary = await this.ai.summarizeActivity({
      context: activityContext(material.activity),
      items: material.items.slice(0, MAX_ITEMS),
    });
    await this.analyses.saveActivitySummary(activityId, summary);
    await this.queue.enqueueProfile(activityId);
  }
}

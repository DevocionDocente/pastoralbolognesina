import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AnalysisResult, MediaContext } from "../domain/analysis";
import { buildChunks } from "../domain/text-chunks";
import type { MediaProcessorRegistry } from "../processors/media-processor-registry";
import type { AnalysisRepository } from "../repositories/analysis-repository";
import type { AiClient } from "./ai-client";
import { describeFailure } from "./analysis-failure";
import type { AnalysisQueue } from "./analysis-queue";
import type { ObjectStorage } from "./object-storage";
import type { ThumbnailGenerator } from "./thumbnail-generator";

export class MediaAnalysisService {
  constructor(
    private readonly analyses: AnalysisRepository,
    private readonly processors: MediaProcessorRegistry,
    private readonly ai: AiClient,
    private readonly storage: ObjectStorage,
    private readonly thumbnails: ThumbnailGenerator,
    private readonly queue: AnalysisQueue,
  ) {}

  async analyze(mediaId: string): Promise<void> {
    const context = await this.analyses.findContext(mediaId);
    if (!context) return;
    await this.analyses.setStatus(mediaId, "processing");
    const workspace = await mkdtemp(join(tmpdir(), "pastoral-analysis-"));
    try {
      const result = await this.processors.for(context).process(context, workspace);
      await this.persist(context, result);
      await this.analyses.setStatus(mediaId, "ready");
      await this.queue.enqueueClassification(mediaId);
      await this.queue.enqueueActivitySummary(context.activity.id);
    } catch (error) {
      const failure = describeFailure(error);
      await this.analyses.setStatus(mediaId, "error", failure.message);
      if (failure.retryable) throw error;
      console.error(`Analysis of media ${mediaId} failed without retry`, error);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  }

  async recoverInterrupted(): Promise<number> {
    const interrupted = await this.analyses.listInterrupted();
    for (const media of interrupted) {
      await this.analyses.setStatus(media.id, "pending");
      await this.queue.enqueueMedia(media.id, media.kind);
    }
    return interrupted.length;
  }

  private async persist(context: MediaContext, result: AnalysisResult): Promise<void> {
    if (result.thumbnail) await this.storeThumbnail(context, result.thumbnail);
    const chunks = buildChunks(context, result);
    const embeddings = await this.ai.embed(chunks.map((chunk) => chunk.content));
    const embedded = chunks.map((chunk, index) => ({ ...chunk, embedding: embeddings[index] }));
    await this.analyses.save(context, result, this.ai.model, embedded);
  }

  private async storeThumbnail(context: MediaContext, frame: Buffer): Promise<void> {
    const thumbnail = await this.thumbnails.fromImage(frame);
    if (!thumbnail) return;
    const key = `thumbnails/${context.activity.id}/${context.media.id}.webp`;
    await this.storage.putObject(key, thumbnail, "image/webp");
    await this.analyses.setThumbnail(context.media.id, key);
  }
}

import { AnalysisUnavailableError, contextLine, type AnalysisResult, type MediaContext } from "../domain/analysis";
import type { AiClient } from "../services/ai-client";
import type { ObjectStorage } from "../services/object-storage";
import type { ThumbnailGenerator } from "../services/thumbnail-generator";
import { emptyResult, type MediaProcessor } from "./media-processor";

export class PhotoProcessor implements MediaProcessor {
  constructor(
    private readonly storage: ObjectStorage,
    private readonly images: ThumbnailGenerator,
    private readonly ai: AiClient,
  ) {}

  supports({ media }: MediaContext): boolean {
    return media.kind === "photo";
  }

  async process(context: MediaContext): Promise<AnalysisResult> {
    const original = await this.storage.getObjectBytes(context.media.storageKey!);
    const image = await this.images.forAnalysis(original);
    if (!image) throw new AnalysisUnavailableError("Image format cannot be analyzed");
    return emptyResult(await this.ai.describePhoto(image, contextLine(context)));
  }
}

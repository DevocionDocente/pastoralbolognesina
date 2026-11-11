import type { MediaContext } from "../domain/analysis";
import type { MediaProcessor } from "./media-processor";

export class MediaProcessorRegistry {
  constructor(private readonly processors: MediaProcessor[]) {}

  for(context: MediaContext): MediaProcessor {
    const processor = this.processors.find((candidate) => candidate.supports(context));
    if (!processor) throw new Error(`No processor for media kind ${context.media.kind}`);
    return processor;
  }
}

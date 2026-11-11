import { contextLine, type AnalysisResult, type MediaContext } from "../domain/analysis";
import type { AiClient } from "../services/ai-client";
import type { DocumentTextExtractor } from "../services/document-text-extractor";
import type { ObjectStorage } from "../services/object-storage";
import { emptyResult, type MediaProcessor } from "./media-processor";

const MIN_READABLE_CHARACTERS = 200;
const MAX_SUMMARY_CHARACTERS = 60_000;

export class DocumentProcessor implements MediaProcessor {
  constructor(
    private readonly storage: ObjectStorage,
    private readonly extractor: DocumentTextExtractor,
    private readonly ai: AiClient,
  ) {}

  supports({ media }: MediaContext): boolean {
    return media.kind === "document";
  }

  async process(context: MediaContext): Promise<AnalysisResult> {
    const file = await this.storage.getObjectBytes(context.media.storageKey!);
    const mimeType = context.media.mimeType ?? "";
    const text = (await this.extractor.extract(file, mimeType)).trim();
    if (text.length < MIN_READABLE_CHARACTERS && mimeType === "application/pdf") {
      const read = await this.ai.readPdf(file, context.media.originalName, contextLine(context));
      return emptyResult({ description: read.description, tags: read.tags, extractedText: read.text });
    }
    const summary = await this.ai.summarize({
      context: contextLine(context),
      kind: "document",
      text: text.slice(0, MAX_SUMMARY_CHARACTERS),
    });
    return emptyResult({ ...summary, extractedText: text });
  }
}

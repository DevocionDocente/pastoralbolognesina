import { join } from "node:path";
import { contextLine, type AnalysisResult, type MediaContext } from "../domain/analysis";
import type { AiClient } from "../services/ai-client";
import type { ObjectStorage } from "../services/object-storage";
import type { VideoToolkit } from "../services/video-toolkit";
import type { AudioTranscriber } from "./audio-transcriber";
import type { MediaProcessor } from "./media-processor";

const MAX_FRAMES = 40;
const MIN_FRAME_INTERVAL = 10;

export class VideoProcessor implements MediaProcessor {
  constructor(
    private readonly storage: ObjectStorage,
    private readonly video: VideoToolkit,
    private readonly transcriber: AudioTranscriber,
    private readonly ai: AiClient,
  ) {}

  supports({ media }: MediaContext): boolean {
    return media.kind === "video";
  }

  async process(context: MediaContext, workspace: string): Promise<AnalysisResult> {
    const path = join(workspace, context.media.originalName.replace(/[^\w.-]/g, "_"));
    await this.storage.downloadToFile(context.media.storageKey!, path);
    const { durationSeconds, hasAudio } = await this.video.probe(path);
    const interval = Math.max(MIN_FRAME_INTERVAL, Math.ceil(durationSeconds / MAX_FRAMES));
    const [thumbnail, frames, transcript] = await Promise.all([
      this.video.thumbnail(path, Math.min(1, durationSeconds / 2)),
      this.video.frames(path, interval, MAX_FRAMES),
      hasAudio ? this.transcriber.transcribe(path) : Promise.resolve(null),
    ]);
    const moments = frames.length > 0 ? await this.ai.describeFrames(frames, contextLine(context)) : [];
    const summary = await this.ai.summarize({ context: contextLine(context), kind: "video", transcript: transcript ?? undefined, moments });
    return { ...summary, transcript, extractedText: null, moments, thumbnail };
  }
}

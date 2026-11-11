import { contextLine, type AnalysisResult, type MediaContext, type Moment } from "../domain/analysis";
import type { AiClient } from "../services/ai-client";
import type { YoutubeFetcher } from "../services/youtube-fetcher";
import type { AudioTranscriber } from "./audio-transcriber";
import { emptyResult, type MediaProcessor } from "./media-processor";

const MAX_AUDIO_SECONDS = 90 * 60;

export class YoutubeProcessor implements MediaProcessor {
  constructor(
    private readonly youtube: YoutubeFetcher,
    private readonly transcriber: AudioTranscriber,
    private readonly ai: AiClient,
  ) {}

  supports({ media }: MediaContext): boolean {
    return media.kind === "youtube";
  }

  async process(context: MediaContext, workspace: string): Promise<AnalysisResult> {
    const videoId = context.media.youtubeId!;
    const details = await this.youtube.details(videoId);
    const transcript = (await this.youtube.subtitles(videoId)) ?? (await this.transcribeAudio(videoId, workspace, details?.durationSeconds));
    const moments = await this.describeThumbnail(videoId, context);
    const summary = await this.ai.summarize({
      context: contextLine(context),
      kind: "youtube",
      title: details?.title ?? context.media.originalName,
      sourceDescription: details?.description ?? undefined,
      transcript: transcript ?? undefined,
      moments,
    });
    return emptyResult({ ...summary, transcript, moments });
  }

  private async describeThumbnail(videoId: string, context: MediaContext): Promise<Moment[]> {
    const thumbnail = await this.youtube.thumbnail(videoId);
    if (!thumbnail) return [];
    const { description } = await this.ai.describePhoto(thumbnail, contextLine(context));
    return [{ second: 0, text: `Miniatura del video: ${description}` }];
  }

  private async transcribeAudio(videoId: string, workspace: string, duration: number | null | undefined) {
    if (duration && duration > MAX_AUDIO_SECONDS) return null;
    const audio = await this.youtube.downloadAudio(videoId, workspace);
    return audio ? this.transcriber.transcribe(audio) : null;
  }
}

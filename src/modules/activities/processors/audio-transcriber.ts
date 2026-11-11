import type { AiClient } from "../services/ai-client";
import type { VideoToolkit } from "../services/video-toolkit";

export class AudioTranscriber {
  constructor(
    private readonly video: VideoToolkit,
    private readonly ai: AiClient,
  ) {}

  async transcribe(path: string): Promise<string | null> {
    const segments = await this.video.audioSegments(path);
    const parts: string[] = [];
    for (const [index, segment] of segments.entries()) {
      parts.push(await this.ai.transcribe(segment, `audio-${index}.mp3`));
    }
    const transcript = parts.join(" ").trim();
    return transcript || null;
  }
}

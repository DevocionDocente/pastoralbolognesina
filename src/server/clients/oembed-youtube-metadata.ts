import type { YoutubeMetadata } from "@/modules/activities/services/youtube-metadata";
import { youtubeWatchUrl } from "@/modules/activities/domain/youtube";

export class OEmbedYoutubeMetadata implements YoutubeMetadata {
  async titleOf(videoId: string): Promise<string | null> {
    const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(youtubeWatchUrl(videoId))}`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return null;
      const body = (await response.json()) as { title?: string };
      return body.title ?? null;
    } catch {
      return null;
    }
  }
}

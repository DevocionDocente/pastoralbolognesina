import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { youtubeThumbnailUrl, youtubeWatchUrl } from "@/modules/activities/domain/youtube";
import type { YoutubeDetails, YoutubeFetcher } from "@/modules/activities/services/youtube-fetcher";
import { runProcess } from "./run-process";

const SUBTITLE_LANGUAGES = "es,es-419,es-ES,es-US,es-MX,en";

export class YtDlpYoutubeFetcher implements YoutubeFetcher {
  constructor(private readonly binary: string) {}

  async details(videoId: string): Promise<YoutubeDetails | null> {
    try {
      const output = await runProcess(this.binary, ["-J", "--skip-download", "--no-warnings", youtubeWatchUrl(videoId)], 120_000);
      const data = JSON.parse(output) as { title?: string; description?: string; duration?: number };
      return { title: data.title ?? null, description: data.description ?? null, durationSeconds: data.duration ?? null };
    } catch (error) {
      console.warn(`yt-dlp could not read details of ${videoId}`, error);
      return null;
    }
  }

  async subtitles(videoId: string): Promise<string | null> {
    const directory = await mkdtemp(join(tmpdir(), "pastoral-subs-"));
    try {
      await runProcess(this.binary, [
        "--skip-download", "--write-subs", "--write-auto-subs", "--sub-langs", SUBTITLE_LANGUAGES,
        "--sub-format", "vtt", "--no-warnings", "-o", join(directory, "subtitle"), youtubeWatchUrl(videoId),
      ], 120_000).catch((error) => console.warn(`yt-dlp reported an error reading subtitles of ${videoId}`, error));
      return await this.readSubtitles(directory);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  private async readSubtitles(directory: string): Promise<string | null> {
    const files = (await readdir(directory)).filter((name) => name.endsWith(".vtt"));
    const preferred = SUBTITLE_LANGUAGES.split(",").map((language) => files.find((name) => name.endsWith(`.${language}.vtt`)));
    const file = preferred.find(Boolean) ?? files[0];
    return file ? vttToText(await readFile(join(directory, file), "utf8")) : null;
  }

  async thumbnail(videoId: string): Promise<Buffer | null> {
    const response = await fetch(youtubeThumbnailUrl(videoId), { signal: AbortSignal.timeout(10_000) }).catch(() => null);
    return response?.ok ? Buffer.from(await response.arrayBuffer()) : null;
  }

  async downloadAudio(videoId: string, directory: string): Promise<string | null> {
    try {
      await runProcess(this.binary, ["-f", "bestaudio/best", "--no-warnings", "-o", join(directory, "youtube-audio.%(ext)s"), youtubeWatchUrl(videoId)]);
      const file = (await readdir(directory)).find((name) => name.startsWith("youtube-audio."));
      return file ? join(directory, file) : null;
    } catch (error) {
      console.warn(`yt-dlp could not download audio of ${videoId}`, error);
      return null;
    }
  }
}

function vttToText(vtt: string): string | null {
  const lines = vtt
    .split(/\r?\n/)
    .filter((line) => line && !line.includes("-->") && !/^(WEBVTT|Kind:|Language:|\d+$)/.test(line))
    .map((line) => line.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
  const unique = lines.filter((line, index) => line !== lines[index - 1]);
  const text = unique.join(" ").trim();
  return text || null;
}

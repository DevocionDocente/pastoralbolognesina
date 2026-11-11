import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Frame } from "@/modules/activities/services/ai-client";
import type { VideoProbe, VideoToolkit } from "@/modules/activities/services/video-toolkit";
import { runProcess } from "./run-process";

const AUDIO_SEGMENT_SECONDS = 20 * 60;

export class FfmpegVideoToolkit implements VideoToolkit {
  constructor(
    private readonly ffmpeg: string,
    private readonly ffprobe: string,
  ) {}

  async probe(path: string): Promise<VideoProbe> {
    const output = await runProcess(this.ffprobe, ["-v", "error", "-show_entries", "format=duration:stream=codec_type", "-of", "json", path]);
    const data = JSON.parse(output) as { format?: { duration?: string }; streams?: { codec_type: string }[] };
    return {
      durationSeconds: Number(data.format?.duration ?? 0),
      hasAudio: (data.streams ?? []).some((stream) => stream.codec_type === "audio"),
    };
  }

  async thumbnail(path: string, atSecond: number): Promise<Buffer | null> {
    return this.inScratch(async (directory) => {
      const target = join(directory, "thumbnail.jpg");
      await runProcess(this.ffmpeg, ["-y", "-loglevel", "error", "-ss", String(atSecond), "-i", path, "-frames:v", "1", "-vf", "scale=960:-2", "-pix_fmt", "yuvj420p", target]);
      return readFile(target).catch(() => null);
    });
  }

  async frames(path: string, everySeconds: number, maxFrames: number): Promise<Frame[]> {
    return this.inScratch(async (directory) => {
      const pattern = join(directory, "frame-%03d.jpg");
      const select = `select='isnan(prev_selected_t)+gte(t-prev_selected_t\\,${everySeconds})',scale=512:-2`;
      await runProcess(this.ffmpeg, ["-y", "-loglevel", "error", "-i", path, "-vf", select, "-fps_mode", "vfr", "-frames:v", String(maxFrames), "-q:v", "5", "-pix_fmt", "yuvj420p", pattern]);
      const files = (await readdir(directory)).filter((file) => file.startsWith("frame-")).sort();
      return Promise.all(files.map(async (file, index) => ({ second: index * everySeconds, image: await readFile(join(directory, file)) })));
    });
  }

  async audioSegments(path: string): Promise<Buffer[]> {
    return this.inScratch(async (directory) => {
      const pattern = join(directory, "audio-%02d.mp3");
      await runProcess(this.ffmpeg, ["-y", "-loglevel", "error", "-i", path, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "32k", "-f", "segment", "-segment_time", String(AUDIO_SEGMENT_SECONDS), pattern]);
      const files = (await readdir(directory)).filter((file) => file.startsWith("audio-")).sort();
      return Promise.all(files.map((file) => readFile(join(directory, file))));
    });
  }

  private async inScratch<T>(work: (directory: string) => Promise<T>): Promise<T> {
    const directory = await mkdtemp(join(tmpdir(), "pastoral-ffmpeg-"));
    try {
      return await work(directory);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}

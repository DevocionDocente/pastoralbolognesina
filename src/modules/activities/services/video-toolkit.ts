import type { Frame } from "./ai-client";

export interface VideoProbe {
  durationSeconds: number;
  hasAudio: boolean;
}

export interface VideoToolkit {
  probe(path: string): Promise<VideoProbe>;
  thumbnail(path: string, atSecond: number): Promise<Buffer | null>;
  frames(path: string, everySeconds: number, maxFrames: number): Promise<Frame[]>;
  audioSegments(path: string): Promise<Buffer[]>;
}

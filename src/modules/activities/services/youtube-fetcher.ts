export interface YoutubeDetails {
  title: string | null;
  description: string | null;
  durationSeconds: number | null;
}

export interface YoutubeFetcher {
  details(videoId: string): Promise<YoutubeDetails | null>;
  subtitles(videoId: string): Promise<string | null>;
  downloadAudio(videoId: string, directory: string): Promise<string | null>;
  thumbnail(videoId: string): Promise<Buffer | null>;
}

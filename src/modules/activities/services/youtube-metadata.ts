export interface YoutubeMetadata {
  titleOf(videoId: string): Promise<string | null>;
}

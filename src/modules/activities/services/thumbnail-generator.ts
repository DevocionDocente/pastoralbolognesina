export interface ThumbnailGenerator {
  fromImage(image: Buffer): Promise<Buffer | null>;
  forAnalysis(image: Buffer): Promise<Buffer | null>;
  reflection(image: Buffer): Promise<Buffer | null>;
}

export interface ImageGenerator {
  generate(scene: string): Promise<Buffer>;
}

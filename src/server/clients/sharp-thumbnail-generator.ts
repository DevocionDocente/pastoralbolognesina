import sharp from "sharp";
import type { ThumbnailGenerator } from "@/modules/activities/services/thumbnail-generator";

const MAX_WIDTH = 640;
const ANALYSIS_SIZE = 1024;
const REFLECTION_WIDTH = 1536;

export class SharpThumbnailGenerator implements ThumbnailGenerator {
  async fromImage(image: Buffer): Promise<Buffer | null> {
    try {
      return await sharp(image).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
    } catch {
      return null;
    }
  }

  async forAnalysis(image: Buffer): Promise<Buffer | null> {
    try {
      return await sharp(image)
        .rotate()
        .resize({ width: ANALYSIS_SIZE, height: ANALYSIS_SIZE, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch {
      return null;
    }
  }

  async reflection(image: Buffer): Promise<Buffer | null> {
    try {
      return await sharp(image).rotate().resize({ width: REFLECTION_WIDTH, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    } catch {
      return null;
    }
  }
}

import { and, asc, eq } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { activities, activitySeries, mediaAnalyses, mediaChunks, mediaItems } from "../schema";
import type { MediaItem } from "../domain/activity";
import type { AnalysisResult, MediaAnalysis, MediaContext } from "../domain/analysis";
import type { ActivityAnalyses, AnalysisRepository, EmbeddedChunk } from "./analysis-repository";
import { mediaColumns } from "./drizzle-media-repository";

const activityColumns = {
  id: activities.id,
  name: activities.name,
  description: activities.description,
  year: activities.year,
  seriesName: activitySeries.name,
};

export class DrizzleAnalysisRepository implements AnalysisRepository {
  constructor(private readonly db: Database) {}

  async findContext(mediaId: string): Promise<MediaContext | null> {
    const [row] = await this.db
      .select({ media: mediaColumns, activity: activityColumns })
      .from(mediaItems)
      .innerJoin(activities, eq(mediaItems.activityId, activities.id))
      .leftJoin(activitySeries, eq(activities.seriesId, activitySeries.id))
      .where(eq(mediaItems.id, mediaId));
    return row ?? null;
  }

  async setStatus(mediaId: string, status: MediaItem["analysisStatus"], error: string | null = null): Promise<void> {
    await this.db.update(mediaItems).set({ analysisStatus: status, analysisError: error }).where(eq(mediaItems.id, mediaId));
  }

  listInterrupted(): Promise<Pick<MediaItem, "id" | "kind">[]> {
    return this.db.select({ id: mediaItems.id, kind: mediaItems.kind }).from(mediaItems).where(eq(mediaItems.analysisStatus, "processing"));
  }

  async setThumbnail(mediaId: string, key: string): Promise<void> {
    await this.db.update(mediaItems).set({ thumbnailKey: key }).where(eq(mediaItems.id, mediaId));
  }

  async save(context: MediaContext, result: AnalysisResult, model: string, chunks: EmbeddedChunk[]): Promise<void> {
    const mediaId = context.media.id;
    const analysis = {
      description: result.description,
      tags: result.tags,
      transcript: result.transcript,
      extractedText: result.extractedText,
      moments: result.moments,
      model,
      updatedAt: new Date(),
    };
    await this.db.transaction(async (tx) => {
      await tx
        .insert(mediaAnalyses)
        .values({ mediaId, ...analysis })
        .onConflictDoUpdate({ target: mediaAnalyses.mediaId, set: analysis });
      await tx.delete(mediaChunks).where(eq(mediaChunks.mediaId, mediaId));
      if (chunks.length > 0) {
        await tx.insert(mediaChunks).values(chunks.map((chunk) => ({ ...chunk, mediaId, activityId: context.activity.id })));
      }
    });
  }

  async findAnalysis(mediaId: string): Promise<MediaAnalysis | null> {
    const [row] = await this.db.select().from(mediaAnalyses).where(eq(mediaAnalyses.mediaId, mediaId));
    return row ?? null;
  }

  async activityAnalyses(activityId: string): Promise<ActivityAnalyses | null> {
    const [row] = await this.db
      .select({ ...activityColumns, summary: activities.aiSummary })
      .from(activities)
      .leftJoin(activitySeries, eq(activities.seriesId, activitySeries.id))
      .where(eq(activities.id, activityId));
    if (!row) return null;
    const { summary, ...activity } = row;
    const rows = await this.db
      .select({ title: mediaItems.title, originalName: mediaItems.originalName, description: mediaAnalyses.description })
      .from(mediaItems)
      .innerJoin(mediaAnalyses, eq(mediaAnalyses.mediaId, mediaItems.id))
      .where(and(eq(mediaItems.activityId, activityId), eq(mediaItems.analysisStatus, "ready")))
      .orderBy(asc(mediaItems.position));
    return { activity, summary, items: rows.map((row) => ({ name: row.title ?? row.originalName, description: row.description })) };
  }

  async saveActivitySummary(activityId: string, summary: string | null): Promise<void> {
    await this.db
      .update(activities)
      .set({ aiSummary: summary, aiSummaryUpdatedAt: summary ? new Date() : null })
      .where(eq(activities.id, activityId));
  }
}

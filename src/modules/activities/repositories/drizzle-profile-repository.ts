import { and, asc, eq, exists, inArray, isNull, sql } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { activities, activityVirtues, mediaItems, virtues } from "../schema";
import {
  isProfileField,
  type ActivityProfile,
  type ActivityVirtue,
  type ProfileField,
  type VirtueAssignment,
} from "../domain/pastoral-profile";
import type { ProfileRepository, ProfileTexts } from "./profile-repository";

export class DrizzleProfileRepository implements ProfileRepository {
  constructor(private readonly db: Database) {}

  async find(activityId: string): Promise<ActivityProfile | null> {
    return (await this.findMany([activityId])).get(activityId) ?? null;
  }

  async findMany(activityIds: string[]): Promise<Map<string, ActivityProfile>> {
    if (activityIds.length === 0) return new Map();
    const [rows, virtuesByActivity] = await Promise.all([
      this.db
        .select({
          activityId: activities.id,
          pastoralDescription: activities.pastoralDescription,
          coexistenceImpact: activities.coexistenceImpact,
          reflectionImageKey: activities.reflectionImageKey,
          manualFields: activities.manualFields,
          status: activities.profileStatus,
        })
        .from(activities)
        .where(inArray(activities.id, activityIds)),
      this.virtuesByActivity(activityIds),
    ]);
    return new Map(
      rows.map((row) => [
        row.activityId,
        { ...row, manualFields: row.manualFields.filter(isProfileField), virtues: virtuesByActivity.get(row.activityId) ?? [] },
      ]),
    );
  }

  async saveTexts(activityId: string, texts: ProfileTexts): Promise<void> {
    if (Object.keys(texts).length === 0) return;
    await this.db.update(activities).set(texts).where(eq(activities.id, activityId));
  }

  async setVirtues(activityId: string, assignments: VirtueAssignment[]): Promise<string[]> {
    return this.db.transaction(async (tx) => {
      const removed = await tx
        .delete(activityVirtues)
        .where(eq(activityVirtues.activityId, activityId))
        .returning({ virtueId: activityVirtues.virtueId, imageKey: activityVirtues.imageKey });
      const images = new Map(removed.map((row) => [row.virtueId, row.imageKey]));
      if (assignments.length > 0) {
        await tx.insert(activityVirtues).values(
          assignments.map(({ virtueId, explanation }, position) => ({
            activityId,
            virtueId,
            explanation,
            position,
            imageKey: images.get(virtueId) ?? null,
          })),
        );
      }
      const kept = new Set(assignments.map((assignment) => assignment.virtueId));
      return removed.filter((row) => row.imageKey && !kept.has(row.virtueId)).map((row) => row.imageKey!);
    });
  }

  async setVirtueImage(activityId: string, virtueId: string, imageKey: string | null): Promise<void> {
    await this.db
      .update(activityVirtues)
      .set({ imageKey })
      .where(and(eq(activityVirtues.activityId, activityId), eq(activityVirtues.virtueId, virtueId)));
  }

  async setManualFields(activityId: string, fields: ProfileField[]): Promise<void> {
    await this.db.update(activities).set({ manualFields: [...new Set(fields)] }).where(eq(activities.id, activityId));
  }

  async setStatus(activityId: string, status: ActivityProfile["status"]): Promise<void> {
    await this.db.update(activities).set({ profileStatus: status }).where(eq(activities.id, activityId));
  }

  async virtuesByActivity(activityIds: string[]): Promise<Map<string, ActivityVirtue[]>> {
    const result = new Map<string, ActivityVirtue[]>();
    if (activityIds.length === 0) return result;
    const rows = await this.db
      .select({
        activityId: activityVirtues.activityId,
        id: virtues.id,
        name: virtues.name,
        explanation: sql<string>`coalesce(nullif(${activityVirtues.explanation}, ''), ${virtues.explanation})`,
        ownExplanation: activityVirtues.explanation,
        imageKey: sql<string | null>`coalesce(${activityVirtues.imageKey}, ${virtues.imageKey})`,
        ownImageKey: activityVirtues.imageKey,
      })
      .from(activityVirtues)
      .innerJoin(virtues, eq(activityVirtues.virtueId, virtues.id))
      .where(inArray(activityVirtues.activityId, activityIds))
      .orderBy(asc(activityVirtues.position));
    for (const { activityId, ...virtue } of rows) result.set(activityId, [...(result.get(activityId) ?? []), virtue]);
    return result;
  }

  async activitiesWithoutProfile(): Promise<string[]> {
    const rows = await this.db
      .select({ id: activities.id })
      .from(activities)
      .where(
        and(
          isNull(activities.pastoralDescription),
          exists(
            this.db
              .select({ id: mediaItems.id })
              .from(mediaItems)
              .where(and(eq(mediaItems.activityId, activities.id), eq(mediaItems.analysisStatus, "ready"))),
          ),
        ),
      );
    return rows.map((row) => row.id);
  }
}

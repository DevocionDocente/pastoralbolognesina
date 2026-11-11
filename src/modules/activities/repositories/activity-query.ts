import { count, desc, eq, sql, type SQL } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { users } from "../../auth/schema";
import { activities, activitySeries, mediaItems } from "../schema";
import type { Activity } from "../domain/activity";

export class ActivityQuery {
  constructor(private readonly db: Database) {}

  async find(condition?: SQL, window?: { limit: number; offset: number }): Promise<Activity[]> {
    const query = this.db
      .select({
        activity: activities,
        seriesName: activitySeries.name,
        creatorName: users.name,
        mediaCount: count(mediaItems.id),
      })
      .from(activities)
      .leftJoin(activitySeries, eq(activities.seriesId, activitySeries.id))
      .leftJoin(users, eq(activities.createdBy, users.id))
      .leftJoin(mediaItems, eq(mediaItems.activityId, activities.id))
      .where(condition)
      .groupBy(activities.id, activitySeries.name, users.name)
      .orderBy(desc(activities.year), sql`${activities.date} desc nulls last`, desc(activities.createdAt));
    const rows = window ? await query.limit(window.limit).offset(window.offset) : await query;
    return rows.map(({ activity, seriesName, creatorName, mediaCount }) => ({
      id: activity.id,
      name: activity.name,
      description: activity.description,
      date: activity.date,
      year: activity.year,
      series: activity.seriesId && seriesName ? { id: activity.seriesId, name: seriesName } : null,
      published: activity.published,
      aiSummary: activity.aiSummary,
      createdBy: activity.createdBy && creatorName ? { id: activity.createdBy, name: creatorName } : null,
      mediaCount,
      createdAt: activity.createdAt,
    }));
  }

  async count(condition?: SQL): Promise<number> {
    const [row] = await this.db
      .select({ total: count() })
      .from(activities)
      .leftJoin(activitySeries, eq(activities.seriesId, activitySeries.id))
      .where(condition);
    return row?.total ?? 0;
  }
}

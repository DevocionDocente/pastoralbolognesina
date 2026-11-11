import { asc, sql } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { activitySeries } from "../schema";
import type { Series } from "../domain/activity";
import type { SeriesRepository } from "./series-repository";

export class DrizzleSeriesRepository implements SeriesRepository {
  constructor(private readonly db: Database) {}

  list(): Promise<Series[]> {
    return this.db
      .select({ id: activitySeries.id, name: activitySeries.name })
      .from(activitySeries)
      .orderBy(asc(activitySeries.name));
  }

  async findOrCreate(name: string): Promise<Series> {
    const [existing] = await this.db
      .select({ id: activitySeries.id, name: activitySeries.name })
      .from(activitySeries)
      .where(sql`lower(${activitySeries.name}) = lower(${name})`);
    if (existing) return existing;
    const [created] = await this.db
      .insert(activitySeries)
      .values({ name })
      .returning({ id: activitySeries.id, name: activitySeries.name });
    return created;
  }
}

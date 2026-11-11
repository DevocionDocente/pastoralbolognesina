import { and, eq, inArray, sql, type SQL } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { activities } from "../schema";
import type { Activity } from "../domain/activity";
import { parseNameSearch } from "../domain/name-search";
import { ActivityQuery } from "./activity-query";
import type { ActivityFilter, ActivityRecordInput, ActivityRepository } from "./activity-repository";

export class DrizzleActivityRepository implements ActivityRepository {
  private readonly query: ActivityQuery;

  constructor(private readonly db: Database) {
    this.query = new ActivityQuery(db);
  }

  async create(input: ActivityRecordInput, createdBy: string): Promise<string> {
    const [row] = await this.db
      .insert(activities)
      .values({ ...input, createdBy })
      .returning({ id: activities.id });
    return row.id;
  }

  async update(id: string, input: ActivityRecordInput): Promise<void> {
    await this.db.update(activities).set({ ...input, updatedAt: new Date() }).where(eq(activities.id, id));
  }

  async setPublished(id: string, published: boolean): Promise<void> {
    await this.db.update(activities).set({ published, updatedAt: new Date() }).where(eq(activities.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(activities).where(eq(activities.id, id));
  }

  async findById(id: string): Promise<Activity | null> {
    const [activity] = await this.query.find(eq(activities.id, id));
    return activity ?? null;
  }

  list(filter: ActivityFilter): Promise<Activity[]> {
    return this.query.find(filter.query?.trim() ? nameSearchCondition(filter.query) : undefined);
  }
}

function nameSearchCondition(query: string): SQL {
  const { words, years } = parseNameSearch(query);
  if (words.length === 0 && years.length === 0) return sql`false`;
  const wordConditions = words.map(
    (word) => sql`unaccent(${activities.name}) ilike unaccent(${`%${word.replace(/[%_\\]/g, "")}%`})`,
  );
  return and(...wordConditions, years.length > 0 ? inArray(activities.year, years) : undefined)!;
}

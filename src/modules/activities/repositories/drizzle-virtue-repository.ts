import { asc, count, eq, inArray, isNull } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { activityVirtues, virtues } from "../schema";
import { normalizeVirtueName, type Virtue } from "../domain/pastoral-profile";
import type { VirtueRepository, VirtueUsage } from "./virtue-repository";

const columns = { id: virtues.id, name: virtues.name, explanation: virtues.explanation, imageKey: virtues.imageKey };

export class DrizzleVirtueRepository implements VirtueRepository {
  constructor(private readonly db: Database) {}

  async list(): Promise<VirtueUsage[]> {
    return this.db
      .select({ ...columns, activityCount: count(activityVirtues.activityId) })
      .from(virtues)
      .leftJoin(activityVirtues, eq(activityVirtues.virtueId, virtues.id))
      .groupBy(virtues.id)
      .orderBy(asc(virtues.name));
  }

  async findById(id: string): Promise<Virtue | null> {
    const [virtue] = await this.db.select(columns).from(virtues).where(eq(virtues.id, id));
    return virtue ?? null;
  }

  findByNormalizedNames(names: string[]) {
    if (names.length === 0) return Promise.resolve([]);
    return this.db
      .select({ ...columns, normalizedName: virtues.normalizedName })
      .from(virtues)
      .where(inArray(virtues.normalizedName, names));
  }

  async create(input: { name: string; explanation: string; source: "ai" | "manual" }): Promise<Virtue> {
    const normalizedName = normalizeVirtueName(input.name);
    const [created] = await this.db
      .insert(virtues)
      .values({ ...input, normalizedName })
      .onConflictDoUpdate({ target: virtues.normalizedName, set: { normalizedName } })
      .returning(columns);
    return created;
  }

  async update(id: string, input: { name: string; explanation: string }): Promise<void> {
    await this.db
      .update(virtues)
      .set({ ...input, normalizedName: normalizeVirtueName(input.name), source: "manual" })
      .where(eq(virtues.id, id));
  }

  async setImage(id: string, key: string | null): Promise<void> {
    await this.db.update(virtues).set({ imageKey: key }).where(eq(virtues.id, id));
  }

  async setExplanation(id: string, explanation: string): Promise<void> {
    await this.db.update(virtues).set({ explanation }).where(eq(virtues.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(virtues).where(eq(virtues.id, id));
  }

  withoutImage(): Promise<Virtue[]> {
    return this.db.select(columns).from(virtues).where(isNull(virtues.imageKey));
  }
}

import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Database } from "@/server/db/database";
import { accessHistory, users } from "../schema";
import type { AccessEntry, AccessHistoryRepository, AccessRecord } from "./access-history-repository";

const performer = alias(users, "performer");

export class DrizzleAccessHistoryRepository implements AccessHistoryRepository {
  constructor(private readonly db: Database) {}

  async record(entry: AccessEntry): Promise<void> {
    await this.db.insert(accessHistory).values(entry);
  }

  listForUser(userId: string): Promise<AccessRecord[]> {
    return this.db
      .select({
        id: accessHistory.id,
        userId: accessHistory.userId,
        action: accessHistory.action,
        roleName: accessHistory.roleName,
        reason: accessHistory.reason,
        note: accessHistory.note,
        addedPermissions: accessHistory.addedPermissions,
        removedPermissions: accessHistory.removedPermissions,
        performedBy: accessHistory.performedBy,
        performedByName: performer.name,
        createdAt: accessHistory.createdAt,
      })
      .from(accessHistory)
      .leftJoin(performer, eq(accessHistory.performedBy, performer.id))
      .where(eq(accessHistory.userId, userId))
      .orderBy(desc(accessHistory.createdAt));
  }
}

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { userPermissions } from "../schema";
import { isPermission } from "../domain/permissions";
import type { PermissionOverride } from "../domain/user-permissions";
import type { UserPermissionRepository } from "./user-permission-repository";

export class DrizzleUserPermissionRepository implements UserPermissionRepository {
  constructor(private readonly db: Database) {}

  async overrides(userId: string): Promise<PermissionOverride[]> {
    const rows = await this.db
      .select({ permission: userPermissions.permission, granted: userPermissions.granted })
      .from(userPermissions)
      .where(eq(userPermissions.userId, userId));
    return rows.flatMap((row) => (isPermission(row.permission) ? [{ permission: row.permission, granted: row.granted }] : []));
  }

  async replace(userId: string, overrides: readonly PermissionOverride[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(userPermissions).where(eq(userPermissions.userId, userId));
      if (overrides.length === 0) return;
      await tx.insert(userPermissions).values(overrides.map((override) => ({ userId, ...override })));
    });
  }
}

import { asc, count, eq, type SQL } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { roles, users } from "../schema";
import type { UserStatus } from "../domain/access";
import type { UserAccess, UserRecord, UserRepository } from "./user-repository";

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<UserRecord | null> {
    const [user] = await this.select(eq(users.id, id));
    return user ?? null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const [user] = await this.select(eq(users.email, email.toLowerCase()));
    return user ?? null;
  }

  list(status?: UserStatus): Promise<UserRecord[]> {
    return this.select(status ? eq(users.status, status) : undefined);
  }

  async updateDetails(id: string, details: { name: string; email: string }): Promise<void> {
    await this.db
      .update(users)
      .set({ name: details.name, email: details.email.toLowerCase(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async setAccess(id: string, access: UserAccess): Promise<void> {
    await this.db.update(users).set({ ...access, updatedAt: new Date() }).where(eq(users.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  async countByRole(roleId: string): Promise<number> {
    const [row] = await this.db.select({ total: count() }).from(users).where(eq(users.roleId, roleId));
    return row?.total ?? 0;
  }

  private async select(condition?: SQL): Promise<UserRecord[]> {
    const rows = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        status: users.status,
        createdAt: users.createdAt,
        roleId: roles.id,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(condition)
      .orderBy(asc(users.name));
    return rows.map(({ roleId, roleName, ...user }) => ({
      ...user,
      role: roleId && roleName ? { id: roleId, name: roleName } : null,
    }));
  }
}

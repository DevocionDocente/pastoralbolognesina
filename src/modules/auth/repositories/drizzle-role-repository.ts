import { asc, count, eq } from "drizzle-orm";
import type { Database } from "@/server/db/database";
import { rolePermissions, roles, users } from "../schema";
import { isPermission, type Permission } from "../domain/permissions";
import type { Role, RoleDetails, RoleInput, RoleRepository } from "./role-repository";

type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export class DrizzleRoleRepository implements RoleRepository {
  constructor(private readonly db: Database) {}

  async findByName(name: string): Promise<Role | null> {
    const [role] = await this.db
      .select({ id: roles.id, name: roles.name })
      .from(roles)
      .where(eq(roles.name, name));
    return role ?? null;
  }

  async findById(id: string): Promise<RoleDetails | null> {
    const all = await this.list();
    return all.find((role) => role.id === id) ?? null;
  }

  async list(): Promise<RoleDetails[]> {
    const [roleRows, permissionRows, countRows] = await Promise.all([
      this.db.select().from(roles).orderBy(asc(roles.createdAt)),
      this.db.select().from(rolePermissions),
      this.db.select({ roleId: users.roleId, total: count() }).from(users).groupBy(users.roleId),
    ]);
    return roleRows.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: permissionRows
        .filter((row) => row.roleId === role.id)
        .map((row) => row.permission)
        .filter(isPermission),
      userCount: countRows.find((row) => row.roleId === role.id)?.total ?? 0,
    }));
  }

  async create(input: RoleInput, isSystem: boolean): Promise<Role> {
    return this.db.transaction(async (tx) => {
      const [role] = await tx
        .insert(roles)
        .values({ name: input.name, description: input.description, isSystem })
        .returning({ id: roles.id, name: roles.name });
      await this.replacePermissions(tx, role.id, input.permissions);
      return role;
    });
  }

  async update(id: string, input: RoleInput): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.update(roles).set({ name: input.name, description: input.description }).where(eq(roles.id, id));
      await this.replacePermissions(tx, id, input.permissions);
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(roles).where(eq(roles.id, id));
  }

  async findPermissions(roleId: string): Promise<Permission[]> {
    const rows = await this.db
      .select({ permission: rolePermissions.permission })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));
    return rows.map((row) => row.permission).filter(isPermission);
  }

  async grantMissing(roleId: string, permissions: readonly Permission[]): Promise<void> {
    if (permissions.length === 0) return;
    await this.db
      .insert(rolePermissions)
      .values(permissions.map((permission) => ({ roleId, permission })))
      .onConflictDoNothing();
  }

  private async replacePermissions(tx: Transaction, roleId: string, permissions: readonly Permission[]) {
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    if (permissions.length === 0) return;
    await tx.insert(rolePermissions).values(permissions.map((permission) => ({ roleId, permission })));
  }
}

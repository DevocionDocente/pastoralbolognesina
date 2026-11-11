import { boolean, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  description: text(),
  isSystem: boolean().notNull().default(false),
  createdAt: timestamp().notNull().defaultNow(),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid()
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permission: text().notNull(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permission] })],
);

export const users = pgTable("users", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  roleId: uuid().references(() => roles.id),
  status: text({ enum: ["pending", "active", "revoked"] }).notNull().default("pending"),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text().primaryKey(),
  token: text().notNull().unique(),
  expiresAt: timestamp().notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const accessHistory = pgTable("access_history", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: text({ enum: ["granted", "revoked", "permissions_changed"] }).notNull(),
  roleName: text(),
  reason: text({ enum: ["cessation", "reassignment", "contract_end", "other"] }),
  note: text(),
  addedPermissions: text().array(),
  removedPermissions: text().array(),
  performedBy: text().references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp().notNull().defaultNow(),
});

export const userPermissions = pgTable(
  "user_permissions",
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permission: text().notNull(),
    granted: boolean().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.permission] })],
);

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export function createDatabase(connectionString: string) {
  return drizzle(new Pool({ connectionString }), { schema, casing: "snake_case" });
}

export type Database = ReturnType<typeof createDatabase>;

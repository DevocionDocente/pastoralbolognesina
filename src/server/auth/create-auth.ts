import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { accounts, sessions, users, verifications } from "@/modules/auth/schema";
import type { Database } from "@/server/db/database";
import type { Environment } from "@/server/env";

export function createAuth(db: Database, environment: Environment) {
  return betterAuth({
    baseURL: environment.BETTER_AUTH_URL,
    secret: environment.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user: users, session: sessions, account: accounts, verification: verifications },
    }),
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    user: {
      additionalFields: {
        roleId: { type: "string", required: false, input: false },
        status: { type: "string", required: false, input: false, defaultValue: "pending" },
      },
    },
    plugins: [openAPI({ disableDefaultReference: true })],
  });
}

export type Auth = ReturnType<typeof createAuth>;

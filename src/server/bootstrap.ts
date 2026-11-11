import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { container } from "./container";
import { env } from "./env";

export async function bootstrap(): Promise<void> {
  const { db, authSetupService, storage, analysisWorker } = container();
  const environment = env();
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await storage.ensureBucket();
  await authSetupService.ensureDefaults({
    name: environment.ROOT_ADMIN_NAME,
    email: environment.ROOT_ADMIN_EMAIL,
    password: environment.ROOT_ADMIN_PASSWORD,
  });
  await analysisWorker?.start();
}

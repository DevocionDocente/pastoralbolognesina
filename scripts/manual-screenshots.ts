import { Client } from "pg";
import { chromium } from "playwright";
import { removeAccessSamples, runAccessFlow } from "./manual/access-flow";
import { removeActivitySamples, runActivitiesFlow } from "./manual/activities-flow";
import { removeGallerySamples, runGalleryFlow } from "./manual/gallery-flow";
import { signInAsAdmin } from "./manual/helpers";
import { runProfileFlow } from "./manual/profile-flow";
import { runSearchFlow } from "./manual/search-flow";

const flows = new Set(process.argv.slice(2).length > 0 ? process.argv.slice(2) : ["access", "activities", "gallery"]);

async function removeSamples() {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  await removeAccessSamples(db);
  await removeActivitySamples(db);
  await removeGallerySamples(db);
  await db.end();
}

async function main() {
  await removeSamples();
  const browser = await chromium.launch();
  const admin = await signInAsAdmin(browser, true);
  if (flows.has("access")) await runAccessFlow(browser, admin);
  if (flows.has("activities")) await runActivitiesFlow(admin);
  if (flows.has("gallery")) await runGalleryFlow(browser, admin);
  if (flows.has("search")) await runSearchFlow(browser);
  if (flows.has("profile")) await runProfileFlow(browser, admin);
  await browser.close();
  if (!process.env.KEEP_SAMPLES) await removeSamples();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

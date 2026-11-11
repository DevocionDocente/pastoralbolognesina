import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { nameFromFolder } from "./import/folder-naming";
import { PastoralClient } from "./import/pastoral-client";

const SUPPORTED = /\.(jpe?g|png|webp|heic|heif|mp4|mov|webm|pdf|docx|xlsx|pptx)$/i;

function argument(name: string, fallback?: string): string {
  const index = process.argv.indexOf(`--${name}`);
  const value = index === -1 ? fallback : process.argv[index + 1];
  if (!value) throw new Error(`Missing --${name}`);
  return value;
}

async function importActivity(client: PastoralClient, root: string, folder: string) {
  const naming = nameFromFolder(folder);
  if (!naming) return console.log(`⚠ ${folder}: no tiene año en el nombre, se omite`);
  const activity = (await client.findActivity(naming.name)) ?? (await client.createActivity(naming));
  const existing = await client.mediaNames(activity.id);
  const files = (await readdir(join(root, folder))).filter((file) => SUPPORTED.test(file)).sort();
  let uploaded = 0;
  for (const file of files) {
    if (existing.has(file)) continue;
    const path = join(root, folder, file);
    await client.upload(activity.id, path, (await stat(path)).size);
    uploaded++;
  }
  if (!activity.published) await client.publish(activity.id);
  console.log(`✓ ${naming.name} (${naming.seriesName}): ${uploaded} nuevos, ${files.length - uploaded} ya existían`);
}

async function main() {
  const root = argument("dir");
  const client = new PastoralClient(argument("url", process.env.BETTER_AUTH_URL));
  await client.signIn(argument("email", process.env.ROOT_ADMIN_EMAIL), argument("password", process.env.ROOT_ADMIN_PASSWORD));
  const folders = (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  for (const folder of folders.sort()) await importActivity(client, root, folder);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

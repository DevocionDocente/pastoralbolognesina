import type { Client } from "pg";
import type { Page } from "playwright";
import { createFixtures } from "./fixtures";
import { BASE_URL, closeDialog, shot } from "./helpers";
import { UNUSED_SERIES_DELETE } from "./sample-data";

const ACTIVITY = "Procesión de Semana Santa";
const SERIES = "Semana Santa";

async function createActivity(page: Page) {
  await page.goto(`${BASE_URL}/dashboard/activities`);
  await page.getByRole("button", { name: "Nueva actividad" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nombre de la actividad").fill(ACTIVITY);
  await dialog.getByLabel("Actividad recurrente (opcional)").fill(SERIES);
  await dialog.getByLabel("Fecha (opcional)").fill("2025-04-18");
  await dialog.getByLabel("Descripción (opcional)").fill("Recorrido por el patio central con la participación de todos los grados.");
  await shot(page, "activities-create");
  await dialog.getByRole("button", { name: "Crear actividad" }).click();
  await page.waitForURL(/\/dashboard\/activities\/[\w-]+$/);
  await page.getByRole("heading", { name: ACTIVITY }).waitFor();
}

async function uploadFiles(page: Page) {
  const files = await createFixtures();
  await shot(page, "activity-empty");
  await page.getByLabel("Elegir archivos").setInputFiles(files);
  await page.getByText("Canto de entrada.mp4").first().waitFor();
  await page.waitForFunction(() => document.querySelectorAll(".animate-spin").length === 0, null, { timeout: 120_000 });
  await page.getByRole("heading", { name: /Documentos/ }).waitFor();
  await shot(page, "activity-upload-progress");
  await page.getByRole("button", { name: "Limpiar lista" }).click();
}

async function addYoutube(page: Page) {
  await page.getByLabel("Enlace de YouTube").fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await page.getByRole("button", { name: "Agregar video" }).click();
  await page.getByRole("heading", { name: /Videos \(2\)/ }).waitFor();
}

async function captureMediaActions(page: Page) {
  await page.getByRole("button", { name: "Acciones para Danza con sombreros.jpg" }).click();
  await page.getByRole("menuitem", { name: "Editar detalles" }).waitFor();
  await shot(page, "activity-media-menu");
  await page.getByRole("menuitem", { name: "Editar detalles" }).click();
  await page.getByRole("dialog").getByLabel("Título (opcional)").fill("Danza tradicional de 5.° grado");
  await shot(page, "activity-media-edit");
  await page.getByRole("dialog").getByRole("button", { name: "Guardar" }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
}

async function publish(page: Page) {
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await page.getByRole("button", { name: "Ocultar", exact: true }).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "activity-detail");
  await page.getByRole("heading", { name: /Fotos/ }).evaluate((heading) => heading.scrollIntoView({ block: "start" }));
  await shot(page, "activity-media");
}

async function captureAnalysis(page: Page) {
  const busy = () => document.body.innerText.includes("En cola") || document.body.innerText.includes("Analizando");
  await page.waitForFunction(busy, null, { timeout: 30_000 }).catch(() => undefined);
  await page.getByRole("heading", { name: /Fotos/ }).evaluate((heading) => heading.scrollIntoView({ block: "start" }));
  await shot(page, "analysis-in-progress");
  await page.waitForFunction((check) => !new Function(`return (${check})()`)(), busy.toString(), { timeout: 300_000 });
  await page.getByText("Resumen generado con IA").waitFor({ timeout: 180_000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "activity-summary");
  await page.getByRole("button", { name: "Acciones para Canto de entrada.mp4" }).click();
  await page.getByRole("menuitem", { name: "Ver análisis de IA" }).click();
  await page.getByText("Lo que se ve en el video").waitFor();
  await page.getByText("Lo que se ve en el video").click();
  await shot(page, "analysis-dialog");
  await closeDialog(page);
}

async function captureList(page: Page) {
  await page.goto(`${BASE_URL}/dashboard/activities`);
  await page.getByRole("link", { name: ACTIVITY }).waitFor();
  await shot(page, "activities-list");
}

async function captureDelete(page: Page) {
  await page.getByRole("link", { name: ACTIVITY }).click();
  await page.getByRole("button", { name: "Eliminar actividad" }).click();
  await shot(page, "activity-delete");
  await closeDialog(page);
}

export async function removeActivitySamples(db: Client) {
  await db.query("DELETE FROM activities WHERE name = $1", [ACTIVITY]);
  await db.query(UNUSED_SERIES_DELETE, [SERIES]);
}

export async function runActivitiesFlow(page: Page) {
  await createActivity(page);
  await uploadFiles(page);
  await addYoutube(page);
  await captureMediaActions(page);
  await publish(page);
  await captureAnalysis(page);
  await captureList(page);
  await captureDelete(page);
}

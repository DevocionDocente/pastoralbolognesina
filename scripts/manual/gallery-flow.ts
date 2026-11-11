import type { Client } from "pg";
import type { Browser, Page } from "playwright";
import { createPdf, createPhotos, createVideo } from "./fixtures";
import { BASE_URL, chooseOption, newPage, shot } from "./helpers";
import { UNUSED_SERIES_DELETE } from "./sample-data";

interface SampleActivity {
  name: string;
  series?: string;
  date?: string;
  year?: number;
  description: string;
  files: () => Promise<string[]>;
  youtube?: string;
}

const SAMPLES: SampleActivity[] = [
  {
    name: "Vía Crucis de Semana Santa",
    series: "Semana Santa",
    year: 2024,
    description: "Recorrido de las catorce estaciones preparado por los alumnos de secundaria.",
    files: () =>
      createPhotos([
        { name: "Estación con velas.jpg", colors: ["#312e81", "#a78bfa"], label: "Vía Crucis" },
        { name: "Cruz en el patio.jpg", colors: ["#3f3f46", "#d4d4d8"], label: "Cruz" },
      ]),
  },
  {
    name: "Procesión de Viernes Santo",
    series: "Semana Santa",
    date: "2025-04-18",
    description: "Recorrido por el patio central con la participación de todos los grados.",
    files: async () => [
      ...(await createPhotos([
        { name: "Procesión en el patio.jpg", colors: ["#7c2d12", "#f59e0b"], label: "Procesión" },
        { name: "Danza con sombreros.jpg", colors: ["#1e3a8a", "#38bdf8"], label: "Danza" },
      ])),
      createVideo("Canto de entrada.mp4"),
      createPdf("Programa Semana Santa 2025.pdf", "Programa de Semana Santa 2025"),
    ],
    youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    name: "Día de la Familia",
    date: "2025-06-14",
    description: "Jornada de integración con juegos, música y una misa de acción de gracias.",
    files: () =>
      createPhotos([
        { name: "Juegos en familia.jpg", colors: ["#9f1239", "#fda4af"], label: "Familias" },
        { name: "Misa de acción de gracias.jpg", colors: ["#14532d", "#a3e635"], label: "Misa" },
      ]),
  },
];

async function seed(page: Page, sample: SampleActivity) {
  await page.goto(`${BASE_URL}/dashboard/activities`);
  await page.getByRole("button", { name: "Nueva actividad" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nombre de la actividad").fill(sample.name);
  if (sample.series) await dialog.getByLabel("Actividad recurrente (opcional)").fill(sample.series);
  if (sample.date) await dialog.getByLabel("Fecha (opcional)").fill(sample.date);
  if (sample.year) await chooseOption(page, "Año", String(sample.year));
  await dialog.getByLabel("Descripción (opcional)").fill(sample.description);
  await dialog.getByRole("button", { name: "Crear actividad" }).click();
  await page.waitForURL(/\/dashboard\/activities\/[\w-]+$/);
  await page.getByLabel("Elegir archivos").setInputFiles(await sample.files());
  await page.waitForFunction(() => document.querySelectorAll(".animate-spin").length === 0, null, { timeout: 120_000 });
  if (sample.youtube) {
    await page.getByLabel("Enlace de YouTube").fill(sample.youtube);
    await page.getByRole("button", { name: "Agregar video" }).click();
    await page.getByText("Video de YouTube agregado.").waitFor();
  }
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await page.getByRole("button", { name: "Ocultar", exact: true }).waitFor();
}

async function captureGallery(page: Page) {
  await page.goto(BASE_URL);
  await page.getByRole("link", { name: /Día de la Familia/ }).waitFor();
  await shot(page, "gallery-home");
  await page.goto(`${BASE_URL}/?view=media&from=2025&to=2025`);
  await page.getByRole("button", { name: "Ver Danza con sombreros.jpg" }).waitFor();
  await shot(page, "gallery-media");
  await page.getByRole("button", { name: "Ver Danza con sombreros.jpg" }).click();
  await page.getByRole("dialog").waitFor();
  await shot(page, "gallery-viewer");
  await page.keyboard.press("Escape");
}

async function captureActivityAndSeries(page: Page) {
  await page.goto(BASE_URL);
  await page.getByRole("link", { name: /Procesión de Viernes Santo/ }).click();
  await page.waitForURL(/\/activities\/[\w-]+$/);
  await page.getByRole("heading", { level: 1, name: "Procesión de Viernes Santo" }).waitFor();
  await shot(page, "gallery-activity");
  await page.getByRole("button", { name: "Ver Canto de entrada.mp4" }).click();
  await page.locator("video").waitFor();
  await shot(page, "gallery-video");
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: /Ver Semana Santa de otros años/ }).click();
  await page.getByRole("heading", { level: 1, name: "Semana Santa" }).waitFor();
}

async function captureMobile(browser: Browser) {
  const page = await newPage(browser);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE_URL);
  await page.getByRole("link", { name: /Día de la Familia/ }).waitFor();
  await shot(page, "gallery-mobile");
}

export async function removeGallerySamples(db: Client) {
  await db.query("DELETE FROM activities WHERE name = ANY($1)", [SAMPLES.map((sample) => sample.name)]);
  await db.query(UNUSED_SERIES_DELETE, ["Semana Santa"]);
}

export async function runGalleryFlow(browser: Browser, admin: Page) {
  for (const sample of SAMPLES) await seed(admin, sample);
  const visitor = await newPage(browser);
  await captureGallery(visitor);
  await captureActivityAndSeries(visitor);
  await captureMobile(browser);
}

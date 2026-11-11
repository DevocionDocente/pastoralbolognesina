import type { Browser } from "playwright";
import { BASE_URL, newPage, shot } from "./helpers";

async function search(page: Awaited<ReturnType<typeof newPage>>, query: string, view?: "media") {
  const params = new URLSearchParams({ q: query, ...(view ? { view } : {}) });
  await page.goto(`${BASE_URL}/?${params}`);
  await page.getByText(/resultados?|actividad(es)?|archivos?/).first().waitFor();
}

export async function runSearchFlow(browser: Browser) {
  const page = await newPage(browser);
  await search(page, "procesión");
  await page.evaluate(() => window.scrollTo(0, 360));
  await shot(page, "search-activities");
  await search(page, "niños rezando", "media");
  await page.evaluate(() => window.scrollTo(0, 360));
  await shot(page, "search-media");
  await search(page, "semana santa");
  await page.getByText("Comparar cómo se vivió cada año").waitFor();
  await page.evaluate(() => window.scrollTo(0, 360));
  await shot(page, "search-series");
  await page.getByText("Comparar cómo se vivió cada año").click();
  await page.getByRole("heading", { level: 1, name: "Semana Santa" }).waitFor();
  await shot(page, "search-timeline");
  const mobile = await newPage(browser);
  await mobile.setViewportSize({ width: 390, height: 844 });
  await search(mobile, "misa");
  await mobile.evaluate(() => window.scrollTo(0, 420));
  await shot(mobile, "search-mobile");
}

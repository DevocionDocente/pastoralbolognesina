import type { Browser, Page } from "playwright";

export const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const OUTPUT = "public/manual";

export async function shot(page: Page, name: string) {
  await page.waitForTimeout(400);
  await page.waitForFunction(() => !document.querySelector("[data-sonner-toast]"), null, { timeout: 10_000 });
  await page.screenshot({ path: `${OUTPUT}/${name}.png` });
}

export async function newPage(browser: Browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, locale: "es-PE" });
  page.on("pageerror", (error) => console.error("Page error:", error.message));
  page.on("console", (message) => message.type() === "error" && console.error("Console:", message.text().slice(0, 8000)));
  return page;
}

export async function signIn(page: Page, email: string, password: string, capture = false) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  if (capture) await shot(page, "login");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL(`${BASE_URL}/dashboard`);
}

export async function signInAsAdmin(browser: Browser, capture = false) {
  const page = await newPage(browser);
  await signIn(page, process.env.ROOT_ADMIN_EMAIL ?? "", process.env.ROOT_ADMIN_PASSWORD ?? "", capture);
  return page;
}

export async function openRowAction(page: Page, name: string, action: string) {
  await page.getByRole("button", { name: `Acciones para ${name}` }).first().click();
  await page.getByRole("menuitem", { name: action }).click();
  await page.getByRole("dialog").waitFor();
}

export async function chooseOption(page: Page, label: string, option: string) {
  await page.getByRole("dialog").getByRole("combobox", { name: label }).click();
  await page.getByRole("option", { name: option }).click();
}

export async function closeDialog(page: Page) {
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
}

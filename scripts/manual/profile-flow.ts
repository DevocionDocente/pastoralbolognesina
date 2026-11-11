import type { Browser, Page } from "playwright";
import { BASE_URL, closeDialog, newPage, shot } from "./helpers";

const ACTIVITY = process.env.PROFILE_ACTIVITY ?? "Óbolo de la Caridad del Papa 2026";

async function openProfileAction(page: Page, action: string) {
  await page.getByRole("button", { name: "Editar perfil" }).click();
  await page.getByRole("menuitem", { name: action }).click();
  await page.getByRole("dialog").waitFor();
}

async function captureDashboard(admin: Page) {
  await admin.goto(`${BASE_URL}/dashboard/activities`);
  await admin.getByRole("link", { name: ACTIVITY }).first().click();
  await admin.getByRole("heading", { name: "Perfil pastoral" }).waitFor();
  await shot(admin, "profile-section");
  await admin.getByRole("button", { name: "Caridad", exact: true }).first().click();
  await admin.getByRole("dialog").waitFor();
  await admin.waitForLoadState("networkidle");
  await shot(admin, "profile-virtue-dialog");
  await closeDialog(admin);
  await admin.getByRole("button", { name: "Editar perfil" }).click();
  await shot(admin, "profile-actions");
  await admin.keyboard.press("Escape");
  for (const [action, name] of [
    ["Editar textos", "profile-texts-dialog"],
    ["Cambiar virtudes", "profile-virtues-dialog"],
    ["Reemplazar imagen", "profile-image-dialog"],
    ["Regenerar con IA", "profile-regenerate-dialog"],
  ]) {
    await openProfileAction(admin, action);
    await shot(admin, name);
    await closeDialog(admin);
  }
  await admin.getByRole("button", { name: /^Acciones para / }).first().click();
  await admin.getByRole("menuitem", { name: "Cambiar tipo" }).click();
  await admin.getByRole("dialog").waitFor();
  await shot(admin, "media-category-dialog");
  await closeDialog(admin);
}

async function captureCatalog(admin: Page) {
  await admin.goto(`${BASE_URL}/dashboard/virtues`);
  await admin.getByRole("heading", { name: "Catálogo de virtudes" }).waitFor();
  await admin.waitForLoadState("networkidle");
  await shot(admin, "virtues-catalog");
  await admin.getByRole("button", { name: "Nueva virtud" }).click();
  await admin.getByRole("dialog").waitFor();
  await shot(admin, "virtue-form-dialog");
  await closeDialog(admin);
  await admin.getByRole("button", { name: /^Acciones para / }).first().click();
  await shot(admin, "virtue-actions");
  await admin.keyboard.press("Escape");
}

async function capturePublic(browser: Browser) {
  const page = await newPage(browser);
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  await shot(page, "gallery-institutional-header");
  await page.evaluate(() => window.scrollTo(0, 700));
  await shot(page, "gallery-profile-cards");
  await page.getByRole("combobox", { name: "Virtud" }).click();
  await shot(page, "gallery-virtue-filter");
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: new RegExp(ACTIVITY) }).first().click();
  await page.getByRole("heading", { level: 1, name: ACTIVITY }).waitFor();
  await page.waitForLoadState("networkidle");
  await shot(page, "public-profile");
  await page.getByRole("button", { name: "Caridad" }).first().click();
  await page.getByRole("dialog").waitFor();
  await page.waitForLoadState("networkidle");
  await shot(page, "public-virtue-dialog");
}

export async function runProfileFlow(browser: Browser, admin: Page) {
  await captureDashboard(admin);
  await captureCatalog(admin);
  await capturePublic(browser);
}

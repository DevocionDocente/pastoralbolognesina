import type { Client } from "pg";
import type { Browser, Page } from "playwright";
import { BASE_URL, chooseOption, newPage, openRowAction, shot, signIn } from "./helpers";

const MEMBER = {
  name: "Rosa Quispe",
  email: "rosa.quispe@colegio.edu.pe",
  password: "Integrante-2026",
};

async function captureDashboard(page: Page) {
  await shot(page, "dashboard");
  await page.getByRole("button", { name: "Menú de usuario" }).click();
  await page.getByText("Cerrar sesión").waitFor();
  await shot(page, "user-menu");
  await page.keyboard.press("Escape");
}

async function registerMember(browser: Browser) {
  const page = await newPage(browser);
  await page.goto(`${BASE_URL}/register`);
  await page.getByLabel("Nombre completo").fill(MEMBER.name);
  await page.getByLabel("Correo electrónico").fill(MEMBER.email);
  await page.getByLabel("Contraseña").fill(MEMBER.password);
  await shot(page, "register");
  await page.getByRole("button", { name: "Solicitar acceso" }).click();
  await page.getByRole("heading", { name: "Tu solicitud está en revisión" }).waitFor();
  await shot(page, "pending-access");
}

async function captureUsers(page: Page) {
  await page.goto(`${BASE_URL}/dashboard/users`);
  await shot(page, "users-pending");
  await openRowAction(page, MEMBER.name, "Aprobar");
  await chooseOption(page, "Rol", "Equipo pastoral");
  await shot(page, "users-approve");
  await page.getByRole("button", { name: "Aprobar" }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.getByRole("tab", { name: "Activos" }).click();
  await shot(page, "users-active");
  await page.getByRole("button", { name: "Nuevo usuario" }).click();
  await shot(page, "users-create");
  await page.keyboard.press("Escape");
  await capturePermissions(page);
  await openRowAction(page, MEMBER.name, "Retirar acceso");
  await chooseOption(page, "Motivo", "Cese");
  await page.getByLabel("Observación (opcional)").fill("Fin del año escolar");
  await shot(page, "users-revoke");
  await page.getByRole("button", { name: "Retirar acceso" }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.getByRole("tab", { name: "Sin acceso" }).click();
  await openRowAction(page, MEMBER.name, "Historial de accesos");
  await page.getByRole("dialog").getByText("Acceso retirado", { exact: false }).first().waitFor();
  await shot(page, "users-history");
  await page.keyboard.press("Escape");
}

async function capturePermissions(page: Page) {
  await openRowAction(page, MEMBER.name, "Permisos");
  const dialog = page.getByRole("dialog");
  await dialog.getByText("Viene de su rol").first().waitFor();
  await dialog.getByLabel("Subir archivos y enlaces de YouTube").click();
  await shot(page, "users-permissions");
  await dialog.getByRole("button", { name: "Guardar permisos" }).click();
  await dialog.waitFor({ state: "hidden" });
}

async function captureRoles(page: Page) {
  await page.goto(`${BASE_URL}/dashboard/roles`);
  await shot(page, "roles");
  await page.getByRole("button", { name: "Nuevo rol" }).click();
  await page.getByRole("dialog").getByLabel("Nombre").fill("Coordinador de pastoral");
  await page.getByLabel("Registrar actividades").click();
  await page.getByLabel("Editar y publicar cualquier actividad").click();
  await page.getByLabel("Subir archivos y enlaces de YouTube").click();
  await shot(page, "roles-create");
  await page.keyboard.press("Escape");
}

async function captureRevoked(browser: Browser) {
  const page = await newPage(browser);
  await signIn(page, MEMBER.email, MEMBER.password);
  await page.getByRole("heading", { name: "Tu acceso al panel fue retirado" }).waitFor();
  await shot(page, "revoked-access");
}

export async function removeAccessSamples(db: Client) {
  await db.query("DELETE FROM users WHERE email = $1", [MEMBER.email]);
}

export async function runAccessFlow(browser: Browser, admin: Page) {
  await captureDashboard(admin);
  await registerMember(browser);
  await captureUsers(admin);
  await captureRoles(admin);
  await admin.goto(`${BASE_URL}/dashboard/account`);
  await shot(admin, "account");
  await captureRevoked(browser);
}

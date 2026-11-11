import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";

const API = "https://api.openai.com/v1";
const ENV_FILE = ".env";
const REQUIRED_MODELS = ["gpt-6-luna", "gpt-transcribe", "text-embedding-3-small"];

interface Check {
  label: string;
  run: (key: string) => Promise<string>;
}

class CheckFailure extends Error {}

function ask(question: string, hidden: boolean): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _encoding, done) {
      if (!muted) process.stdout.write(chunk);
      done();
    },
  });
  const reader = createInterface({ input: process.stdin, output, terminal: true });
  return new Promise((resolve) => {
    reader.question(question, (answer) => {
      reader.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
    muted = hidden;
  });
}

async function call(key: string, path: string, body?: unknown) {
  const response = await fetch(`${API}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (response.ok) return payload;
  const code = payload?.error?.code ?? payload?.error?.type ?? response.status;
  if (response.status === 401) throw new CheckFailure("La clave no es válida o fue revocada.");
  if (code === "insufficient_quota") throw new CheckFailure("La cuenta no tiene saldo. Agrega créditos en platform.openai.com/settings/organization/billing.");
  throw new CheckFailure(`OpenAI respondió ${response.status}: ${payload?.error?.message ?? "error desconocido"}`);
}

const CHECKS: Check[] = [
  {
    label: "Clave válida y modelos disponibles",
    run: async (key) => {
      const { data } = await call(key, "/models");
      const available = new Set((data as { id: string }[]).map((model) => model.id));
      const missing = REQUIRED_MODELS.filter((model) => !available.has(model));
      if (missing.length > 0) throw new CheckFailure(`La cuenta no tiene acceso a: ${missing.join(", ")}`);
      return REQUIRED_MODELS.join(", ");
    },
  },
  {
    label: "Embeddings (text-embedding-3-small)",
    run: async (key) => {
      const { data } = await call(key, "/embeddings", { model: "text-embedding-3-small", input: "danza con sombreros" });
      return `vector de ${data[0].embedding.length} dimensiones`;
    },
  },
  {
    label: "Modelo de visión y resúmenes (gpt-6-luna)",
    run: async (key) => {
      const result = await call(key, "/responses", {
        model: "gpt-6-luna",
        input: "Responde solo con la palabra: listo",
        max_output_tokens: 16,
      });
      return `respondió "${String(result.output_text ?? "").trim() || "ok"}"`;
    },
  },
];

async function verify(key: string): Promise<boolean> {
  for (const check of CHECKS) {
    try {
      console.log(`  ✓ ${check.label}: ${await check.run(key)}`);
    } catch (error) {
      console.log(`  ✗ ${check.label}: ${error instanceof CheckFailure ? error.message : String(error)}`);
      return false;
    }
  }
  return true;
}

function upsert(content: string, name: string, value: string): string {
  const lines = content.split(/\r?\n/).filter((line) => !line.startsWith(`${name}=`) && line !== "");
  return [...lines, `${name}=${value}`].join("\n") + "\n";
}

function saveLocally(key: string) {
  const current = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
  writeFileSync(ENV_FILE, upsert(current, "OPENAI_API_KEY", key));
  console.log(`Guardada en ${ENV_FILE}.`);
}

function saveOnVps(composeId: string, key: string) {
  const info = JSON.parse(execFileSync("vps", ["compose", "info", composeId, "--json"], { encoding: "utf8" }));
  const env = upsert(String(info.env ?? ""), "OPENAI_API_KEY", key);
  execFileSync("vps", ["compose", "env", composeId, "--set", env, "--json"], { stdio: "ignore" });
  console.log(`Guardada en el VPS (compose ${composeId}). Redespliega para aplicarla.`);
}

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const key = process.env.OPENAI_API_KEY_INPUT ?? (await ask("Pega tu clave de OpenAI (no se mostrará): ", true));
  if (!key.startsWith("sk-")) throw new CheckFailure("Eso no parece una clave de OpenAI (debe empezar con sk-).");
  console.log("Probando la clave…");
  if (!(await verify(key))) process.exit(1);
  saveLocally(key);
  const composeId = argument("vps");
  if (composeId) saveOnVps(composeId, key);
}

main().catch((error) => {
  console.error(error instanceof CheckFailure ? error.message : error);
  process.exit(1);
});

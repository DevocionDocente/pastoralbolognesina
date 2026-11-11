const BASE_URL = process.argv[2] ?? "http://localhost:3000";

interface Case {
  query: string;
  expected: string[];
  exact: boolean;
}

const CASES: Case[] = [
  { query: "santa rosa", expected: ["Santa Rosa de Lima 2025", "Santa Rosa de Lima 2026"], exact: true },
  { query: "cristo moreno", expected: ["Señor de los Milagros 2024", "Señor de los Milagros 2025"], exact: true },
  { query: "señor de los milagros", expected: ["Señor de los Milagros 2024", "Señor de los Milagros 2025"], exact: true },
  { query: "semana santa", expected: ["Semana Santa 2023", "Semana Santa 2024", "Semana Santa 2025"], exact: true },
  { query: "óbolo", expected: ["Óbolo de la Caridad del Papa 2024", "Óbolo de la Caridad del Papa 2025", "Óbolo de la Caridad del Papa 2026"], exact: true },
  { query: "virgen inmaculada", expected: ["Patrona Virgen Inmaculada 2023", "Patrona Virgen Inmaculada 2025"], exact: true },
  { query: "navidad", expected: ["Navidad 2024"], exact: true },
  { query: "día del maestro", expected: ["Día del Maestro 2026"], exact: true },
  { query: "domund", expected: ["DOMUND 2024"], exact: true },
  { query: "aniversario del colegio", expected: ["Aniversario 2024", "Aniversario 2026"], exact: true },
  { query: "niños rezando", expected: ["Oración del Inicio del Año Escolar 2026"], exact: false },
  { query: "colecta de dinero", expected: ["Óbolo de la Caridad del Papa 2026"], exact: false },
  { query: "procesión", expected: ["Señor de los Milagros 2024", "Semana Santa 2023"], exact: false },
];

async function run(item: Case) {
  const response = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(item.query)}`);
  const body = await response.json();
  const names: string[] = (body.activities?.items ?? []).map((activity: { name: string }) => activity.name);
  const found = item.expected.filter((name) => names.includes(name)).length;
  const recall = found / item.expected.length;
  const precision = names.length === 0 ? 0 : names.filter((name) => item.expected.includes(name)).length / names.length;
  return { ...item, names, recall, precision };
}

async function main() {
  let passed = 0;
  for (const item of CASES) {
    const started = Date.now();
    const result = await run(item);
    const ok = result.recall === 1 && (!item.exact || result.precision === 1);
    if (ok) passed += 1;
    const metrics = `R=${result.recall.toFixed(2)}${item.exact ? ` P=${result.precision.toFixed(2)}` : ""}`;
    console.log(`${ok ? "PASS" : "FAIL"} ${item.query.padEnd(24)} ${metrics} ${Date.now() - started}ms -> ${result.names.join(" | ")}`);
  }
  console.log(`\n${passed}/${CASES.length} cases passed`);
}

main();

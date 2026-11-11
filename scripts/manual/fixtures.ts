import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const DIRECTORY = join(tmpdir(), "pastoral-manual-fixtures");

export interface PhotoSpec {
  name: string;
  colors: [string, string];
  label: string;
}

function target(name: string) {
  mkdirSync(DIRECTORY, { recursive: true });
  return join(DIRECTORY, name);
}

function photoSvg(colors: string[], label: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/>
    </linearGradient></defs>
    <rect width="1600" height="1200" fill="url(#g)"/>
    <text x="800" y="640" font-family="Georgia" font-size="140" fill="white" text-anchor="middle">${label}</text>
  </svg>`;
}

function minimalPdf(text: string) {
  const stream = `BT /F1 28 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let body = "%PDF-1.4\n";
  const offsets = objects.map((object, index) => {
    const offset = body.length;
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  return `${body}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
}

export async function createPhotos(photos: PhotoSpec[]): Promise<string[]> {
  return Promise.all(
    photos.map(async ({ name, colors, label }) => {
      const path = target(name);
      await sharp(Buffer.from(photoSvg(colors, label))).jpeg({ quality: 85 }).toFile(path);
      return path;
    }),
  );
}

export function createPdf(name: string, text: string): string {
  const path = target(name);
  writeFileSync(path, minimalPdf(text));
  return path;
}

export function createVideo(name: string): string {
  const path = target(name);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "testsrc=duration=4:size=640x360:rate=24", "-pix_fmt", "yuv420p", path]);
  return path;
}

export async function createFixtures(): Promise<string[]> {
  const photos = await createPhotos([
    { name: "Procesión en el patio.jpg", colors: ["#7c2d12", "#f59e0b"], label: "Procesión" },
    { name: "Danza con sombreros.jpg", colors: ["#1e3a8a", "#38bdf8"], label: "Danza" },
    { name: "Misa de clausura.jpg", colors: ["#14532d", "#a3e635"], label: "Misa" },
  ]);
  return [...photos, createPdf("Programa Semana Santa 2025.pdf", "Programa de Semana Santa 2025"), createVideo("Canto de entrada.mp4")];
}

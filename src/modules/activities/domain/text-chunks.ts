import { contextLine, type AnalysisResult, type MediaContext } from "./analysis";

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;
const MAX_TEXT_CHUNKS = 40;

export type ChunkSource = "description" | "transcript" | "text" | "moment";

export interface TextChunk {
  source: ChunkSource;
  content: string;
  second: number | null;
}

export function splitText(text: string, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const chunks: string[] = [];
  for (let start = 0; start < normalized.length; start += size - overlap) {
    chunks.push(normalized.slice(start, start + size));
    if (start + size >= normalized.length) break;
  }
  return chunks;
}

export function buildChunks(context: MediaContext, result: AnalysisResult): TextChunk[] {
  const prefix = contextLine(context);
  const withPrefix = (source: ChunkSource, content: string, second: number | null = null) => ({
    source,
    content: `${prefix}\n${content}`,
    second,
  });
  const tags = result.tags.length > 0 ? `\nEtiquetas: ${result.tags.join(", ")}` : "";
  return [
    withPrefix("description", `${result.description}${tags}`),
    ...splitText(result.transcript ?? "").slice(0, MAX_TEXT_CHUNKS).map((part) => withPrefix("transcript", `Se escucha: ${part}`)),
    ...splitText(result.extractedText ?? "").slice(0, MAX_TEXT_CHUNKS).map((part) => withPrefix("text", `Contenido: ${part}`)),
    ...result.moments.map((moment) => withPrefix("moment", `Se ve: ${moment.text}`, moment.second)),
  ];
}

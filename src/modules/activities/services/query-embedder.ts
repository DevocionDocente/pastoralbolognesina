import type { AiClient } from "./ai-client";

const CACHE_SIZE = 500;

export interface QueryEmbedder {
  embedQueries(texts: string[]): Promise<number[][]>;
}

export class CachingQueryEmbedder implements QueryEmbedder {
  private readonly cache = new Map<string, number[]>();

  constructor(private readonly ai: Pick<AiClient, "embed">) {}

  async embedQueries(texts: string[]): Promise<number[][]> {
    const keys = texts.map((text) => text.trim().toLowerCase());
    const missing = [...new Set(keys.filter((key) => !this.cache.has(key)))];
    if (missing.length > 0) {
      const vectors = await this.ai.embed(missing);
      missing.forEach((key, index) => this.remember(key, vectors[index]));
    }
    return keys.map((key) => this.cache.get(key)!);
  }

  private remember(key: string, vector: number[]): void {
    if (this.cache.size >= CACHE_SIZE) this.cache.delete(this.cache.keys().next().value!);
    this.cache.set(key, vector);
  }
}

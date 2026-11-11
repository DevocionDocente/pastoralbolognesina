import { createHash } from "node:crypto";
import {
  NO_EXPANSION,
  type CatalogEntry,
  type QueryExpansion,
  type RelevanceCandidate,
  type RelevanceVerdict,
} from "../domain/search";
import type { AiClient } from "./ai-client";

const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_SIZE = 300;

export interface SearchAssistantSettings {
  timeoutMs: number;
}

interface CacheEntry<T> {
  value: Promise<T | null>;
  expiresAt: number;
}

export class SearchAssistant {
  private readonly expansions = new Map<string, CacheEntry<QueryExpansion>>();
  private readonly verdicts = new Map<string, CacheEntry<RelevanceVerdict[]>>();

  constructor(
    private readonly ai: Pick<AiClient, "expandSearch" | "judgeSearch"> | null,
    private readonly settings: SearchAssistantSettings,
  ) {}

  async expand(query: string, catalog: () => Promise<CatalogEntry[]>): Promise<QueryExpansion> {
    const ai = this.ai;
    if (!ai) return NO_EXPANSION;
    const key = query.trim().toLowerCase();
    const expansion = await this.cached(this.expansions, key, async () => ai.expandSearch(query, await catalog()));
    return expansion ?? NO_EXPANSION;
  }

  judge(query: string, expansion: QueryExpansion, candidates: RelevanceCandidate[]): Promise<RelevanceVerdict[] | null> {
    const ai = this.ai;
    if (!ai || candidates.length === 0) return Promise.resolve(null);
    const fingerprint = createHash("sha1").update(JSON.stringify(candidates)).digest("hex");
    const key = `${query.trim().toLowerCase()}|${fingerprint}`;
    return this.cached(this.verdicts, key, () => ai.judgeSearch({ query, variants: expansion.variants, candidates }));
  }

  private cached<T>(cache: Map<string, CacheEntry<T>>, key: string, load: () => Promise<T>): Promise<T | null> {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.value;
    const value = withTimeout(load(), this.settings.timeoutMs).catch((error) => {
      cache.delete(key);
      console.error("Search assistant unavailable, falling back to plain ranking", error);
      return null;
    });
    if (cache.size >= CACHE_SIZE) cache.delete(cache.keys().next().value!);
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)),
  ]);
}

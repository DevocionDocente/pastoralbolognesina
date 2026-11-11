import { cleanVirtueName, normalizeVirtueName, type Virtue } from "../domain/pastoral-profile";
import type { VirtueRepository } from "../repositories/virtue-repository";
import type { AnalysisQueue } from "./analysis-queue";

export interface VirtueEntry {
  name: string;
  explanation: string;
}

export class VirtueResolver {
  constructor(
    private readonly virtues: VirtueRepository,
    private readonly queue: AnalysisQueue,
  ) {}

  async resolve(entries: VirtueEntry[], source: "ai" | "manual"): Promise<Virtue[]> {
    const unique = uniqueEntries(entries);
    const existing = await this.virtues.findByNormalizedNames(unique.map((entry) => entry.normalizedName));
    const byName = new Map(existing.map((virtue) => [virtue.normalizedName, virtue]));
    const resolved: Virtue[] = [];
    for (const entry of unique) resolved.push(byName.get(entry.normalizedName) ?? (await this.create(entry, source)));
    return resolved;
  }

  private async create(entry: VirtueEntry, source: "ai" | "manual"): Promise<Virtue> {
    const virtue = await this.virtues.create({ name: cleanVirtueName(entry.name), explanation: entry.explanation.trim(), source });
    await this.queue.enqueueVirtueArt(virtue.id);
    return virtue;
  }
}

function uniqueEntries(entries: VirtueEntry[]): (VirtueEntry & { normalizedName: string })[] {
  const seen = new Map<string, VirtueEntry & { normalizedName: string }>();
  for (const entry of entries) {
    const normalizedName = normalizeVirtueName(entry.name);
    if (normalizedName && !seen.has(normalizedName)) seen.set(normalizedName, { ...entry, normalizedName });
  }
  return [...seen.values()];
}

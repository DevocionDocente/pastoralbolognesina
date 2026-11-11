import type { Virtue } from "../domain/pastoral-profile";

export interface VirtueUsage extends Virtue {
  activityCount: number;
}

export interface VirtueRepository {
  list(): Promise<VirtueUsage[]>;
  findById(id: string): Promise<Virtue | null>;
  findByNormalizedNames(names: string[]): Promise<(Virtue & { normalizedName: string })[]>;
  create(input: { name: string; explanation: string; source: "ai" | "manual" }): Promise<Virtue>;
  update(id: string, input: { name: string; explanation: string }): Promise<void>;
  setImage(id: string, key: string | null): Promise<void>;
  setExplanation(id: string, explanation: string): Promise<void>;
  delete(id: string): Promise<void>;
  withoutImage(): Promise<Virtue[]>;
}

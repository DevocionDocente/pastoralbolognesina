import type { Series } from "../domain/activity";

export interface SeriesRepository {
  list(): Promise<Series[]>;
  findOrCreate(name: string): Promise<Series>;
}

import type { Activity } from "../domain/activity";

export interface ActivityRecordInput {
  name: string;
  description: string | null;
  date: string | null;
  year: number;
  seriesId: string | null;
}

export interface ActivityFilter {
  query?: string;
}

export interface ActivityRepository {
  create(input: ActivityRecordInput, createdBy: string): Promise<string>;
  update(id: string, input: ActivityRecordInput): Promise<void>;
  setPublished(id: string, published: boolean): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Activity | null>;
  list(filter: ActivityFilter): Promise<Activity[]>;
}

import type { ActivityProfile, ActivityVirtue, ProfileField, VirtueAssignment } from "../domain/pastoral-profile";

export interface ProfileTexts {
  pastoralDescription?: string | null;
  coexistenceImpact?: string | null;
  reflectionImageKey?: string | null;
}

export interface ProfileRepository {
  find(activityId: string): Promise<ActivityProfile | null>;
  findMany(activityIds: string[]): Promise<Map<string, ActivityProfile>>;
  saveTexts(activityId: string, texts: ProfileTexts): Promise<void>;
  setVirtues(activityId: string, assignments: VirtueAssignment[]): Promise<string[]>;
  setVirtueImage(activityId: string, virtueId: string, imageKey: string | null): Promise<void>;
  setManualFields(activityId: string, fields: ProfileField[]): Promise<void>;
  setStatus(activityId: string, status: ActivityProfile["status"]): Promise<void>;
  virtuesByActivity(activityIds: string[]): Promise<Map<string, ActivityVirtue[]>>;
  activitiesWithoutProfile(): Promise<string[]>;
}

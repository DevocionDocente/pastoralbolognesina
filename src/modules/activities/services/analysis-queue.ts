import type { MediaKind } from "../domain/media-kind";
import type { ProfileField } from "../domain/pastoral-profile";

export interface AnalysisQueue {
  enqueueMedia(mediaId: string, kind: MediaKind): Promise<void>;
  enqueueActivitySummary(activityId: string): Promise<void>;
  enqueueProfile(activityId: string, fields?: ProfileField[]): Promise<void>;
  enqueueVirtueArt(virtueId: string, options?: { renewImage?: boolean }): Promise<void>;
  enqueueActivityVirtueArt(activityId: string, virtueId: string): Promise<void>;
  enqueueClassification(mediaId: string): Promise<void>;
}

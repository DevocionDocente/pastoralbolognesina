import type { MediaKind } from "@/modules/activities/domain/media-kind";
import type { ProfileField } from "@/modules/activities/domain/pastoral-profile";
import type { AnalysisQueue } from "@/modules/activities/services/analysis-queue";
import { QUEUES, type JobBroker } from "./job-broker";

const SUMMARY_DEBOUNCE_SECONDS = 30;
const EXPIRATION_SECONDS: Record<MediaKind, number> = { photo: 10 * 60, document: 20 * 60, youtube: 30 * 60, video: 60 * 60 };

export class PgBossAnalysisQueue implements AnalysisQueue {
  constructor(private readonly broker: JobBroker) {}

  async enqueueMedia(mediaId: string, kind: MediaKind): Promise<void> {
    const boss = await this.broker.ready();
    await boss.send(QUEUES.analyzeMedia, { mediaId }, { expireInSeconds: EXPIRATION_SECONDS[kind] });
  }

  async enqueueActivitySummary(activityId: string): Promise<void> {
    const boss = await this.broker.ready();
    await boss.sendDebounced(QUEUES.summarizeActivity, { activityId }, null, SUMMARY_DEBOUNCE_SECONDS, activityId);
  }

  async enqueueProfile(activityId: string, fields: ProfileField[] = []): Promise<void> {
    const boss = await this.broker.ready();
    await boss.send(QUEUES.generateProfile, { activityId, fields }, { singletonKey: `${activityId}:${fields.join(",")}` });
  }

  async enqueueVirtueArt(virtueId: string, options: { renewImage?: boolean } = {}): Promise<void> {
    const boss = await this.broker.ready();
    const renewImage = options.renewImage ?? false;
    await boss.send(QUEUES.virtueArt, { virtueId, renewImage }, { singletonKey: `${virtueId}:${renewImage}` });
  }

  async enqueueActivityVirtueArt(activityId: string, virtueId: string): Promise<void> {
    const boss = await this.broker.ready();
    await boss.send(QUEUES.activityVirtueArt, { activityId, virtueId }, { singletonKey: `${activityId}:${virtueId}` });
  }

  async enqueueClassification(mediaId: string): Promise<void> {
    const boss = await this.broker.ready();
    await boss.send(QUEUES.classifyMedia, { mediaId }, { singletonKey: mediaId });
  }
}

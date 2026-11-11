import type { ProfileField } from "@/modules/activities/domain/pastoral-profile";
import type { ActivitySummaryService } from "@/modules/activities/services/activity-summary-service";
import type { MediaAnalysisService } from "@/modules/activities/services/media-analysis-service";
import type { MediaClassificationService } from "@/modules/activities/services/media-classification-service";
import type { PastoralProfileService } from "@/modules/activities/services/pastoral-profile-service";
import type { ActivityVirtueArtService } from "@/modules/activities/services/activity-virtue-art-service";
import type { VirtueArtService } from "@/modules/activities/services/virtue-art-service";
import { QUEUES, type JobBroker } from "@/server/jobs/job-broker";

export interface WorkerServices {
  analysis: MediaAnalysisService;
  summaries: ActivitySummaryService;
  classification: MediaClassificationService;
  profiles: PastoralProfileService;
  virtueArt: VirtueArtService;
  activityVirtueArt: ActivityVirtueArtService;
}

export class AnalysisWorker {
  constructor(
    private readonly broker: JobBroker,
    private readonly services: WorkerServices,
  ) {}

  async start(): Promise<void> {
    await this.register();
    const { analysis, classification, profiles, virtueArt } = this.services;
    const recovered = {
      analyses: await analysis.recoverInterrupted(),
      categories: await classification.recoverUncategorized(),
      profiles: await profiles.recoverMissing(),
      virtues: await virtueArt.recoverIncomplete(),
    };
    console.log(`Analysis worker started, requeued ${JSON.stringify(recovered)}`);
  }

  private async register(): Promise<void> {
    const boss = await this.broker.ready();
    const { analysis, summaries, classification, profiles, virtueArt, activityVirtueArt } = this.services;
    await boss.work<{ mediaId: string }>(QUEUES.analyzeMedia, { batchSize: 1 }, ([job]) => analysis.analyze(job.data.mediaId));
    await boss.work<{ activityId: string }>(QUEUES.summarizeActivity, { batchSize: 1 }, ([job]) =>
      summaries.summarize(job.data.activityId),
    );
    await boss.work<{ mediaId: string }>(QUEUES.classifyMedia, { batchSize: 1 }, ([job]) => classification.classify(job.data.mediaId));
    await boss.work<{ activityId: string; fields: ProfileField[] }>(QUEUES.generateProfile, { batchSize: 1 }, ([job]) =>
      profiles.generate(job.data.activityId, job.data.fields),
    );
    await boss.work<{ virtueId: string; renewImage: boolean }>(QUEUES.virtueArt, { batchSize: 1 }, ([job]) =>
      virtueArt.complete(job.data.virtueId, job.data.renewImage),
    );
    await boss.work<{ activityId: string; virtueId: string }>(QUEUES.activityVirtueArt, { batchSize: 1 }, ([job]) =>
      activityVirtueArt.draw(job.data.activityId, job.data.virtueId),
    );
  }
}

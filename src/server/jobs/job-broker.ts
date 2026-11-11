import { PgBoss } from "pg-boss";

export const QUEUES = {
  analyzeMedia: "analyze-media",
  summarizeActivity: "summarize-activity",
  generateProfile: "generate-profile",
  virtueArt: "virtue-art",
  activityVirtueArt: "activity-virtue-art",
  classifyMedia: "classify-media",
} as const;

export class JobBroker {
  private readonly boss: PgBoss;
  private starting?: Promise<PgBoss>;

  constructor(connectionString: string) {
    this.boss = new PgBoss(connectionString);
    this.boss.on("error", (error) => console.error("Job broker error", error));
  }

  ready(): Promise<PgBoss> {
    this.starting ??= this.start();
    return this.starting;
  }

  private async start(): Promise<PgBoss> {
    await this.boss.start();
    await this.boss.createQueue(QUEUES.analyzeMedia, { retryLimit: 3, retryDelay: 60, retryBackoff: true, expireInSeconds: 60 * 60 });
    await this.boss.createQueue(QUEUES.summarizeActivity, { retryLimit: 2, retryDelay: 60 });
    await this.boss.createQueue(QUEUES.generateProfile, { retryLimit: 2, retryDelay: 120, expireInSeconds: 15 * 60 });
    await this.boss.createQueue(QUEUES.virtueArt, { retryLimit: 2, retryDelay: 120, expireInSeconds: 10 * 60 });
    await this.boss.createQueue(QUEUES.activityVirtueArt, { retryLimit: 2, retryDelay: 120, expireInSeconds: 10 * 60 });
    await this.boss.createQueue(QUEUES.classifyMedia, { retryLimit: 2, retryDelay: 60 });
    return this.boss;
  }
}

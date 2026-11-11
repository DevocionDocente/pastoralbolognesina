import type { Virtue } from "../domain/pastoral-profile";
import type { VirtueRepository } from "../repositories/virtue-repository";
import type { AiClient } from "./ai-client";
import type { AnalysisQueue } from "./analysis-queue";
import type { ImageGenerator } from "./image-generator";
import type { ReflectionImageStore } from "./reflection-image-store";

export class VirtueArtService {
  constructor(
    private readonly virtues: VirtueRepository,
    private readonly ai: AiClient,
    private readonly images: ImageGenerator,
    private readonly store: ReflectionImageStore,
    private readonly queue: AnalysisQueue,
  ) {}

  async complete(virtueId: string, renewImage = false): Promise<void> {
    const virtue = await this.virtues.findById(virtueId);
    if (!virtue) return;
    const explanation = virtue.explanation || (await this.explain(virtue));
    if (virtue.imageKey && !renewImage) return;
    const image = await this.images.generate(
      `A scene of everyday school life where students and teachers live the Christian virtue "${virtue.name}", inviting meditation on it: ${explanation}`,
    );
    await this.virtues.setImage(virtue.id, await this.store.replace(`virtues/${virtue.id}`, image, virtue.imageKey));
  }

  async recoverIncomplete(): Promise<number> {
    const incomplete = await this.virtues.withoutImage();
    for (const virtue of incomplete) await this.queue.enqueueVirtueArt(virtue.id);
    return incomplete.length;
  }

  private async explain(virtue: Virtue): Promise<string> {
    const explanation = await this.ai.explainVirtue(virtue.name);
    await this.virtues.setExplanation(virtue.id, explanation);
    return explanation;
  }
}

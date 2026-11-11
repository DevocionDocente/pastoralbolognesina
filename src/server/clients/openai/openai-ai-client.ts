import OpenAI, { toFile } from "openai";
import type { ResponseInputContent } from "openai/resources/responses/responses";
import type {
  ActivityMaterial,
  AiClient,
  CategoryMaterial,
  Description,
  Frame,
  GeneratedProfile,
  ProfileMaterial,
  RelevanceMaterial,
  SummaryMaterial,
} from "@/modules/activities/services/ai-client";
import type { MediaCategory } from "@/modules/activities/domain/media-category";
import type { ImageGenerator } from "@/modules/activities/services/image-generator";
import type { Moment } from "@/modules/activities/domain/analysis";
import type { CatalogEntry, QueryExpansion, RelevanceVerdict } from "@/modules/activities/domain/search";
import { DESCRIPTION_SCHEMA, DOCUMENT_SCHEMA, MOMENTS_SCHEMA, PROMPTS } from "./openai-prompts";
import { expansionSchema, relevanceSchema, SEARCH_PROMPTS } from "./openai-search-prompts";
import type { SchoolReferences } from "./school-references";
import { CATEGORY_SCHEMA, EXPLANATION_SCHEMA, IMAGE_STYLE, PASTORAL_PROMPTS, PROFILE_SCHEMA } from "./openai-pastoral-prompts";

const FRAMES_PER_REQUEST = 20;
const EMBEDDINGS_PER_REQUEST = 96;

export interface OpenAiSettings {
  apiKey: string;
  visionModel: string;
  transcriptionModel: string;
  embeddingModel: string;
  imageModel: string;
}

export class OpenAiClient implements AiClient, ImageGenerator {
  private readonly client: OpenAI;

  constructor(
    private readonly settings: OpenAiSettings,
    private readonly references: SchoolReferences,
  ) {
    this.client = new OpenAI({ apiKey: settings.apiKey, maxRetries: 3 });
  }

  get model(): string {
    return this.settings.visionModel;
  }

  describePhoto(image: Buffer, context: string): Promise<Description> {
    return this.structured<Description>("photo_description", DESCRIPTION_SCHEMA, [
      { type: "input_text", text: PROMPTS.photo(context) },
      { type: "input_image", image_url: dataUrl("image/jpeg", image), detail: "auto" },
    ]);
  }

  async describeFrames(frames: Frame[], context: string): Promise<Moment[]> {
    const moments: Moment[] = [];
    for (let start = 0; start < frames.length; start += FRAMES_PER_REQUEST) {
      const batch = frames.slice(start, start + FRAMES_PER_REQUEST);
      const content: ResponseInputContent[] = [{ type: "input_text", text: PROMPTS.frames(context) }];
      for (const frame of batch) {
        content.push({ type: "input_text", text: `Segundo ${frame.second}` });
        content.push({ type: "input_image", image_url: dataUrl("image/jpeg", frame.image), detail: "low" });
      }
      const result = await this.structured<{ moments: Moment[] }>("video_moments", MOMENTS_SCHEMA, content);
      moments.push(...result.moments);
    }
    return moments;
  }

  readPdf(pdf: Buffer, fileName: string, context: string): Promise<Description & { text: string }> {
    return this.structured("document_reading", DOCUMENT_SCHEMA, [
      { type: "input_text", text: PROMPTS.pdf(context) },
      { type: "input_file", filename: fileName, file_data: dataUrl("application/pdf", pdf) },
    ]);
  }

  summarize(material: SummaryMaterial): Promise<Description> {
    return this.structured<Description>("material_summary", DESCRIPTION_SCHEMA, [
      { type: "input_text", text: PROMPTS.summary(material) },
    ]);
  }

  async summarizeActivity(material: ActivityMaterial): Promise<string> {
    const response = await this.client.responses.create({
      model: this.settings.visionModel,
      reasoning: { effort: "low" },
      input: [{ role: "user", content: [{ type: "input_text", text: PROMPTS.activity(material) }] }],
    });
    return response.output_text.trim();
  }

  async transcribe(audio: Buffer, fileName: string): Promise<string> {
    const result = await this.client.audio.transcriptions.create({
      model: this.settings.transcriptionModel,
      file: await toFile(audio, fileName, { type: "audio/mpeg" }),
      language: "es",
    });
    return result.text;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const vectors: number[][] = [];
    for (let start = 0; start < texts.length; start += EMBEDDINGS_PER_REQUEST) {
      const batch = texts.slice(start, start + EMBEDDINGS_PER_REQUEST);
      const result = await this.client.embeddings.create({ model: this.settings.embeddingModel, input: batch });
      vectors.push(...result.data.map((item) => item.embedding));
    }
    return vectors;
  }

  async classify(material: CategoryMaterial): Promise<MediaCategory> {
    const result = await this.structured<{ category: MediaCategory }>("media_category", CATEGORY_SCHEMA, [
      { type: "input_text", text: PASTORAL_PROMPTS.category(material) },
    ]);
    return result.category;
  }

  pastoralProfile(material: ProfileMaterial): Promise<GeneratedProfile> {
    return this.structured<GeneratedProfile>("pastoral_profile", PROFILE_SCHEMA, [
      { type: "input_text", text: PASTORAL_PROMPTS.profile(material) },
    ]);
  }

  async explainVirtue(name: string): Promise<string> {
    const result = await this.structured<{ explanation: string }>("virtue_explanation", EXPLANATION_SCHEMA, [
      { type: "input_text", text: PASTORAL_PROMPTS.virtue(name) },
    ]);
    return result.explanation;
  }

  async expandSearch(query: string, catalog: CatalogEntry[]): Promise<QueryExpansion> {
    const ids = catalog.map((entry) => entry.id);
    return this.structured<QueryExpansion>("search_expansion", expansionSchema(ids), [
      { type: "input_text", text: SEARCH_PROMPTS.expansion(query, catalog) },
    ]);
  }

  async judgeSearch(material: RelevanceMaterial): Promise<RelevanceVerdict[]> {
    const ids = material.candidates.map((candidate) => candidate.id);
    const result = await this.structured<{ verdicts: RelevanceVerdict[] }>("search_relevance", relevanceSchema(ids), [
      { type: "input_text", text: SEARCH_PROMPTS.relevance(material) },
    ]);
    return result.verdicts;
  }

  async generate(scene: string): Promise<Buffer> {
    const result = await this.client.images.edit({
      model: this.settings.imageModel,
      image: await this.references.images(),
      prompt: `${IMAGE_STYLE}\n\n${this.references.guide()}\n\nScene:\n${scene}`,
      size: "1536x1024",
      quality: "medium",
      output_format: "webp",
      output_compression: 85,
    });
    const image = result.data?.[0]?.b64_json;
    if (!image) throw new Error("Image generation returned no data");
    return Buffer.from(image, "base64");
  }

  private async structured<T>(name: string, schema: Record<string, unknown>, content: ResponseInputContent[]): Promise<T> {
    const response = await this.client.responses.create({
      model: this.settings.visionModel,
      reasoning: { effort: "low" },
      input: [{ role: "user", content }],
      text: { format: { type: "json_schema", name, schema, strict: true } },
    });
    return JSON.parse(response.output_text) as T;
  }
}

function dataUrl(mimeType: string, data: Buffer): string {
  return `data:${mimeType};base64,${data.toString("base64")}`;
}

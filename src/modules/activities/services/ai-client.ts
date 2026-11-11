import type { Moment } from "../domain/analysis";
import type { MediaCategory } from "../domain/media-category";
import type { CatalogEntry, QueryExpansion, RelevanceCandidate, RelevanceVerdict } from "../domain/search";

export interface Description {
  description: string;
  tags: string[];
}

export interface Frame {
  second: number;
  image: Buffer;
}

export interface SummaryMaterial {
  context: string;
  kind: "video" | "youtube" | "document";
  title?: string;
  sourceDescription?: string;
  transcript?: string;
  moments?: Moment[];
  text?: string;
}

export interface ActivityMaterial {
  context: string;
  items: { name: string; description: string }[];
}

export interface CategoryMaterial {
  kind: string;
  name: string;
  description: string;
}

export interface ProfileMaterial {
  context: string;
  summary: string | null;
  items: { name: string; description: string }[];
  existingVirtues: string[];
}

export interface GeneratedProfile {
  pastoralDescription: string;
  coexistenceImpact: string;
  virtues: { name: string; explanation: string }[];
  imagePrompt: string;
}

export interface RelevanceMaterial {
  query: string;
  variants: string[];
  candidates: RelevanceCandidate[];
}

export interface AiClient {
  readonly model: string;
  describePhoto(image: Buffer, context: string): Promise<Description>;
  describeFrames(frames: Frame[], context: string): Promise<Moment[]>;
  readPdf(pdf: Buffer, fileName: string, context: string): Promise<Description & { text: string }>;
  summarize(material: SummaryMaterial): Promise<Description>;
  summarizeActivity(material: ActivityMaterial): Promise<string>;
  transcribe(audio: Buffer, fileName: string): Promise<string>;
  embed(texts: string[]): Promise<number[][]>;
  classify(material: CategoryMaterial): Promise<MediaCategory>;
  pastoralProfile(material: ProfileMaterial): Promise<GeneratedProfile>;
  explainVirtue(name: string): Promise<string>;
  expandSearch(query: string, catalog: CatalogEntry[]): Promise<QueryExpansion>;
  judgeSearch(material: RelevanceMaterial): Promise<RelevanceVerdict[]>;
}

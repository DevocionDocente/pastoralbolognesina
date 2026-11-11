import type { AnalysisResult, MediaContext } from "../domain/analysis";

export interface MediaProcessor {
  supports(context: MediaContext): boolean;
  process(context: MediaContext, workspace: string): Promise<AnalysisResult>;
}

export function emptyResult(overrides: Partial<AnalysisResult>): AnalysisResult {
  return { description: "", tags: [], transcript: null, extractedText: null, moments: [], thumbnail: null, ...overrides };
}

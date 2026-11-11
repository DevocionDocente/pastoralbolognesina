const RRF_K = 60;
const KEYWORD_WEIGHT = 0.5;

export interface SemanticMatch {
  mediaId: string;
  activityId: string;
  distance: number;
  content: string;
  second: number | null;
}

export interface KeywordMatch {
  id: string;
  rank: number;
}

export interface MediaHit {
  mediaId: string;
  activityId: string;
  score: number;
  evidence: string | null;
  second: number | null;
}

export interface ActivityHit {
  activityId: string;
  score: number;
  mediaIds: string[];
}

export function reciprocalRank(position: number): number {
  return 1 / (RRF_K + position + 1);
}

export function fuseMedia(semantic: SemanticMatch[], keyword: (KeywordMatch & { activityId: string })[]): MediaHit[] {
  const hits = new Map<string, MediaHit>();
  const bestSemantic = new Map<string, SemanticMatch>();
  for (const match of semantic) {
    if (!bestSemantic.has(match.mediaId)) bestSemantic.set(match.mediaId, match);
  }
  [...bestSemantic.values()].forEach((match, position) =>
    hits.set(match.mediaId, {
      mediaId: match.mediaId,
      activityId: match.activityId,
      score: reciprocalRank(position),
      evidence: match.content,
      second: match.second,
    }),
  );
  keyword.forEach((match, position) => {
    const existing = hits.get(match.id);
    const score = reciprocalRank(position) * KEYWORD_WEIGHT;
    if (existing) existing.score += score;
    else hits.set(match.id, { mediaId: match.id, activityId: match.activityId, score, evidence: null, second: null });
  });
  return [...hits.values()].sort((a, b) => b.score - a.score);
}

export function rankActivities(media: MediaHit[], activityKeyword: KeywordMatch[], highlights = 4): ActivityHit[] {
  const hits = new Map<string, ActivityHit>();
  for (const hit of media) {
    const activity = hits.get(hit.activityId) ?? { activityId: hit.activityId, score: 0, mediaIds: [] };
    if (activity.mediaIds.length < highlights) {
      activity.score += hit.score;
      activity.mediaIds.push(hit.mediaId);
    }
    hits.set(hit.activityId, activity);
  }
  activityKeyword.forEach((match, position) => {
    const activity = hits.get(match.id) ?? { activityId: match.id, score: 0, mediaIds: [] };
    activity.score += reciprocalRank(position) * 2;
    hits.set(match.id, activity);
  });
  return [...hits.values()].sort((a, b) => b.score - a.score);
}

export function evidenceSnippet(content: string | null, maxLength = 180): string | null {
  if (!content) return null;
  const body = content.split("\n").slice(1).join(" ").replace(/\s+/g, " ").trim() || content;
  return body.length > maxLength ? `${body.slice(0, maxLength).trimEnd()}…` : body;
}

export const MIN_RELEVANCE = 2;

export interface CatalogEntry {
  id: string;
  name: string;
  series: string | null;
}

export interface QueryExpansion {
  variants: string[];
  activityIds: string[];
}

export interface RelevanceCandidate {
  id: string;
  title: string;
  series: string | null;
  description: string;
  evidence: string[];
}

export interface RelevanceVerdict {
  id: string;
  score: number;
}

export const NO_EXPANSION: QueryExpansion = { variants: [], activityIds: [] };

export function searchTerms(query: string, expansion: QueryExpansion): string[] {
  const terms = [query, ...expansion.variants].map((term) => term.trim()).filter(Boolean);
  return [...new Map(terms.map((term) => [term.toLowerCase(), term])).values()];
}

export function closestFirst(matches: SemanticMatch[]): SemanticMatch[] {
  return [...matches].sort((a, b) => a.distance - b.distance);
}

export function boostNamed(hits: ActivityHit[], activityIds: string[]): ActivityHit[] {
  const named = new Set(activityIds);
  return hits
    .map((hit) => (named.has(hit.activityId) ? { ...hit, score: hit.score + 1 } : hit))
    .sort((a, b) => b.score - a.score);
}

export function keepRelevant(hits: ActivityHit[], verdicts: RelevanceVerdict[]): ActivityHit[] {
  const scores = new Map(verdicts.map((verdict) => [verdict.id, verdict.score]));
  return hits
    .filter((hit) => (scores.get(hit.activityId) ?? 0) >= MIN_RELEVANCE)
    .sort((a, b) => scores.get(b.activityId)! - scores.get(a.activityId)!);
}

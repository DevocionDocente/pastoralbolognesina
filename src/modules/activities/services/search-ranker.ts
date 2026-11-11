import type { GalleryFilter } from "../domain/gallery";
import {
  boostNamed,
  closestFirst,
  evidenceSnippet,
  fuseMedia,
  keepRelevant,
  rankActivities,
  searchTerms,
  type ActivityHit,
  type MediaHit,
  type QueryExpansion,
  type RelevanceCandidate,
} from "../domain/search";
import type { ProfileRepository } from "../repositories/profile-repository";
import type { SearchRepository } from "../repositories/search-repository";
import type { QueryEmbedder } from "./query-embedder";
import type { SearchAssistant } from "./search-assistant";

const SEMANTIC_LIMIT = 300;
const KEYWORD_LIMIT = 200;
const CANDIDATES = 20;
const EVIDENCE_PER_ACTIVITY = 3;
const SUMMARY_LENGTH = 500;

export interface RankingSettings {
  maxDistance: number;
}

export interface RankedSearch {
  expansion: QueryExpansion;
  activities: ActivityHit[];
  media: MediaHit[];
}

export class SearchRanker {
  constructor(
    private readonly search: SearchRepository,
    private readonly profiles: ProfileRepository,
    private readonly embedder: QueryEmbedder | null,
    private readonly assistant: SearchAssistant,
    private readonly settings: RankingSettings,
  ) {}

  async rank(query: string, filter: GalleryFilter): Promise<RankedSearch> {
    const expansion = await this.expand(query);
    const terms = searchTerms(query, expansion);
    const [media, activityMatches] = await Promise.all([
      this.mediaHits(terms, filter),
      this.search.keywordActivities(terms, filter, KEYWORD_LIMIT),
    ]);
    const candidates = boostNamed(rankActivities(media, activityMatches), expansion.activityIds).slice(0, CANDIDATES);
    const activities = await this.filterRelevant(query, expansion, candidates, media);
    const relevant = new Set(activities.map((hit) => hit.activityId));
    return { expansion, activities, media: media.filter((hit) => relevant.has(hit.activityId)) };
  }

  expand(query: string): Promise<QueryExpansion> {
    return this.assistant.expand(query, () => this.search.catalog());
  }

  private async filterRelevant(query: string, expansion: QueryExpansion, candidates: ActivityHit[], media: MediaHit[]) {
    const verdicts = await this.assistant.judge(query, expansion, await this.describe(candidates, media));
    return verdicts ? keepRelevant(candidates, verdicts) : candidates;
  }

  private async describe(candidates: ActivityHit[], media: MediaHit[]): Promise<RelevanceCandidate[]> {
    const ids = candidates.map((hit) => hit.activityId);
    const [activities, profiles] = await Promise.all([this.search.activities(ids), this.profiles.findMany(ids)]);
    return activities.map((activity) => ({
      id: activity.id,
      title: activity.name,
      series: activity.series?.name ?? null,
      description: [profiles.get(activity.id)?.pastoralDescription, activity.description, activity.aiSummary?.slice(0, SUMMARY_LENGTH)]
        .filter(Boolean)
        .join("\n"),
      evidence: media
        .filter((hit) => hit.activityId === activity.id && hit.evidence)
        .slice(0, EVIDENCE_PER_ACTIVITY)
        .map((hit) => evidenceSnippet(hit.evidence)!),
    }));
  }

  private async mediaHits(terms: string[], filter: GalleryFilter): Promise<MediaHit[]> {
    const [semantic, keyword] = await Promise.all([
      this.semantic(terms, filter),
      this.search.keywordMedia(terms.join(" "), filter, KEYWORD_LIMIT),
    ]);
    return fuseMedia(closestFirst(semantic), keyword);
  }

  private async semantic(terms: string[], filter: GalleryFilter) {
    if (!this.embedder) return [];
    const vectors = await this.embedder.embedQueries(terms);
    const results = await Promise.all(
      vectors.map((vector) => this.search.semantic(vector, filter, SEMANTIC_LIMIT, this.settings.maxDistance)),
    );
    return results.flat();
  }
}

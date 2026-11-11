import type { MediaItem } from "../domain/activity";
import type { MediaUrlResolver } from "../services/media-url-resolver";
import type { ActivitySearchResult, MediaSearchResult, SearchService } from "../services/search-service";
import { toMediaDto } from "./activity-mappers";
import type { ProfilePresenter } from "./profile-presenter";
import { toFilter } from "./public-gallery-presenter";
import type { ActivitySearchCardDto, MediaSearchItemDto, SearchQuery, SearchResponseDto } from "./public-schemas";

export class SearchPresenter {
  constructor(
    private readonly service: SearchService,
    private readonly urls: MediaUrlResolver,
    private readonly profiles: ProfilePresenter,
  ) {}

  async run(query: SearchQuery): Promise<SearchResponseDto> {
    const filter = { ...toFilter(query), query: undefined };
    const [series, activities, media] = await Promise.all([
      this.service.series(query.q),
      query.view === "activities" ? this.service.activities(query.q, filter, query.page) : null,
      query.view === "media" ? this.service.media(query.q, filter, query.page) : null,
    ]);
    return {
      query: query.q,
      series,
      activities: activities && { ...activities, items: await Promise.all(activities.items.map((item) => this.card(item))) },
      media: media && { ...media, items: await Promise.all(media.items.map((item) => this.mediaItem(item))) },
    };
  }

  private async card({ activity, cover, counts, highlights, profile }: ActivitySearchResult): Promise<ActivitySearchCardDto> {
    const { id, name, description, date, year, series, aiSummary } = activity;
    return {
      id,
      name,
      description,
      date,
      year,
      series,
      aiSummary,
      counts,
      cover: cover ? await this.dto(cover) : null,
      highlights: await Promise.all(highlights.map((item) => this.dto(item))),
      profile: await this.profiles.publicProfile(profile),
    };
  }

  private async mediaItem({ item, activity, evidence, second }: MediaSearchResult): Promise<MediaSearchItemDto> {
    return { ...(await this.dto(item)), activity, evidence, second };
  }

  private async dto(item: MediaItem) {
    return toMediaDto(item, await this.urls.resolve(item));
  }
}

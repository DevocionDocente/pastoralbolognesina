import type { Activity, MediaItem } from "../domain/activity";
import type { ActivitySummary, GalleryFilter, GalleryMedia, Paginated } from "../domain/gallery";
import type { MediaUrlResolver } from "../services/media-url-resolver";
import type { PublicGalleryService } from "../services/public-gallery-service";
import { toMediaDto } from "./activity-mappers";
import type { ProfilePresenter } from "./profile-presenter";
import type {
  ActivityCardDto,
  GalleryMediaDto,
  GalleryQuery,
  PageDto,
  PublicActivityDetailDto,
  SeriesTimelineDto,
} from "./public-schemas";

export class PublicGalleryPresenter {
  constructor(
    private readonly gallery: PublicGalleryService,
    private readonly urls: MediaUrlResolver,
    private readonly profiles: ProfilePresenter,
  ) {}

  async activities(query: GalleryQuery): Promise<PageDto<ActivityCardDto>> {
    const page = await this.gallery.activities(toFilter(query), query.page);
    return this.mapPage(page, (summary) => this.card(summary));
  }

  async media(query: GalleryQuery): Promise<PageDto<GalleryMediaDto>> {
    const page = await this.gallery.media(toFilter(query), query.page);
    return this.mapPage(page, async ({ item, activity }: GalleryMedia) => ({ ...(await this.mediaDto(item)), activity }));
  }

  async activity(id: string): Promise<PublicActivityDetailDto> {
    const { activity, media, profile } = await this.gallery.activity(id);
    return {
      ...toPublicActivity(activity),
      media: await Promise.all(media.map((item) => this.mediaDto(item))),
      profile: await this.profiles.publicProfile(profile),
    };
  }

  async series(id: string): Promise<SeriesTimelineDto> {
    const { name, editions } = await this.gallery.series(id);
    return {
      id,
      name,
      editions: await Promise.all(
        editions.map(async ({ activity, counts, previews }) => ({
          ...toPublicActivity(activity),
          counts,
          previews: await Promise.all(previews.map((item) => this.mediaDto(item))),
        })),
      ),
    };
  }

  private async card({ activity, cover, counts, profile }: ActivitySummary): Promise<ActivityCardDto> {
    return {
      ...toPublicActivity(activity),
      counts,
      cover: cover ? await this.mediaDto(cover) : null,
      profile: await this.profiles.publicProfile(profile),
    };
  }

  private async mediaDto(item: MediaItem) {
    return toMediaDto(item, await this.urls.resolve(item));
  }

  private async mapPage<T, R>(page: Paginated<T>, map: (item: T) => Promise<R>): Promise<PageDto<R>> {
    return { ...page, items: await Promise.all(page.items.map(map)) };
  }
}

export function toFilter(query: GalleryQuery): GalleryFilter {
  return {
    query: query.q || undefined,
    fromYear: query.from,
    toYear: query.to,
    seriesId: query.series,
    kind: query.kind,
    category: query.category,
    virtueId: query.virtue,
  };
}

function toPublicActivity(activity: Activity) {
  const { id, name, description, date, year, series, aiSummary } = activity;
  return { id, name, description, date, year, series, aiSummary };
}

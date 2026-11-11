import type { MediaItem } from "../domain/activity";
import { youtubeThumbnailUrl, youtubeWatchUrl } from "../domain/youtube";
import type { ObjectStorage } from "./object-storage";

export interface MediaUrls {
  thumbnailUrl: string | null;
  viewUrl: string;
  downloadUrl: string | null;
}

export class MediaUrlResolver {
  constructor(private readonly storage: ObjectStorage) {}

  async resolve(item: MediaItem): Promise<MediaUrls> {
    if (item.kind === "youtube" && item.youtubeId) {
      return {
        thumbnailUrl: youtubeThumbnailUrl(item.youtubeId),
        viewUrl: youtubeWatchUrl(item.youtubeId),
        downloadUrl: null,
      };
    }
    const key = item.storageKey!;
    const [viewUrl, downloadUrl, thumbnailUrl] = await Promise.all([
      this.storage.presignDownload(key),
      this.storage.presignDownload(key, { fileName: item.originalName, attachment: true }),
      item.thumbnailKey ? this.storage.presignDownload(item.thumbnailKey) : null,
    ]);
    return { viewUrl, downloadUrl, thumbnailUrl };
  }

  async imageUrl(key: string | null): Promise<string | null> {
    return key ? this.storage.presignDownload(key) : null;
  }
}

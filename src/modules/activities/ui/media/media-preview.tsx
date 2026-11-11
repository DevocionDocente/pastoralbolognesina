import type { MediaDto } from "../../http/activity-schemas";
import { MediaKindIcon } from "./media-kind-icon";

export function MediaPreview({ media }: { media: MediaDto }) {
  if (media.thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- presigned storage URLs change on every request
      <img src={media.thumbnailUrl} alt={media.title ?? media.originalName} loading="lazy" className="size-full object-cover" />
    );
  }
  return (
    <div className="flex size-full items-center justify-center bg-muted">
      <MediaKindIcon media={media} className="size-10 text-muted-foreground" />
    </div>
  );
}

import { CalendarHeartIcon } from "lucide-react";
import type { MediaDto } from "../../http/activity-schemas";
import { MediaPreview } from "../media/media-preview";

interface ActivityCardCoverProps {
  imageUrl: string | null;
  cover: MediaDto | null;
  name: string;
}

export function ActivityCardCover({ imageUrl, cover, name }: ActivityCardCoverProps) {
  return (
    <div className="aspect-[3/2] overflow-hidden bg-muted">
      <div className="size-full transition-transform duration-300 group-hover:scale-105">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- presigned storage URLs change on every request
          <img src={imageUrl} alt={`Imagen de reflexión de ${name}`} loading="lazy" className="size-full object-cover" />
        ) : cover ? (
          <MediaPreview media={cover} />
        ) : (
          <div className="flex size-full items-center justify-center">
            <CalendarHeartIcon className="size-10 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

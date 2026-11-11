import type { MediaDto } from "../../http/activity-schemas";
import { MediaPreview } from "../media/media-preview";

export function MatchHighlights({ media }: { media: MediaDto[] }) {
  if (media.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-muted-foreground">Coincidencias con tu búsqueda</p>
      <div className="grid grid-cols-4 gap-1.5">
        {media.map((item) => (
          <div key={item.id} className="aspect-square overflow-hidden rounded-md bg-muted" title={item.title ?? item.originalName}>
            <MediaPreview media={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

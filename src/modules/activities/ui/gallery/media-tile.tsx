import { PlayIcon } from "lucide-react";
import type { MediaDto } from "../../http/activity-schemas";
import { MediaPreview } from "../media/media-preview";
import { DownloadButton } from "./download-button";

interface MediaTileProps {
  media: MediaDto;
  caption?: string;
  evidence?: string | null;
  onOpen: () => void;
}

export function MediaTile({ media, caption, evidence, onOpen }: MediaTileProps) {
  const playable = media.kind === "video" || media.kind === "youtube";
  const name = media.title ?? media.originalName;
  return (
    <div className="group relative flex flex-col gap-1.5">
      <button type="button" onClick={onOpen} className="flex flex-col gap-1.5 text-left" aria-label={`Ver ${name}`}>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
          <div className="size-full transition-transform duration-300 group-hover:scale-105">
            <MediaPreview media={media} />
          </div>
          {playable && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-black/55 p-3 text-white">
                <PlayIcon className="size-5 fill-current" />
              </span>
            </span>
          )}
        </div>
        <span className="truncate pr-1 text-sm">{name}</span>
        {caption && <span className="-mt-1 truncate text-xs text-muted-foreground">{caption}</span>}
        {evidence && <span className="line-clamp-3 text-xs text-muted-foreground italic">“{evidence}”</span>}
      </button>
      {media.downloadUrl && <DownloadButton url={media.downloadUrl} name={media.originalName} className="absolute top-2 right-2" />}
    </div>
  );
}

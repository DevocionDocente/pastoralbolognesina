import { formatBytes } from "@/shared/lib/format";
import type { MediaDto } from "../../http/activity-schemas";
import { AnalysisStatusBadge } from "../analysis/analysis-status-badge";
import { MediaCardActions } from "./media-card-actions";
import { MediaCategoryBadge } from "./media-category-badge";
import { MediaPreview } from "./media-preview";

export function MediaCard({ media, canEdit, canDelete }: { media: MediaDto; canEdit: boolean; canDelete: boolean }) {
  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-[4/3]">
        <a href={media.viewUrl} target="_blank" rel="noreferrer" className="block size-full" aria-label={`Abrir ${media.originalName}`}>
          <MediaPreview media={media} />
        </a>
        <div className="absolute bottom-2 left-2">
          <AnalysisStatusBadge status={media.analysisStatus} />
        </div>
        <div className="absolute top-2 right-2">
          <MediaCardActions media={media} canEdit={canEdit} canDelete={canDelete} />
        </div>
      </div>
      <div className="flex flex-col items-start gap-1 p-3">
        <MediaCategoryBadge media={media} />
        <p className="w-full truncate text-sm font-medium" title={media.originalName}>
          {media.title ?? media.originalName}
        </p>
        <p className="w-full truncate text-xs text-muted-foreground">
          {media.title ? media.originalName : media.kind === "youtube" ? "YouTube" : formatBytes(media.sizeBytes ?? 0)}
        </p>
      </div>
    </article>
  );
}

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import type { SeriesEditionDto } from "../../http/public-schemas";
import { MediaPreview } from "../media/media-preview";
import { formatCalendarDay } from "@/shared/lib/format";
import { MediaCountsLine } from "./media-counts-line";

export function EditionCard({ edition }: { edition: SeriesEditionDto }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-1">
        {edition.date && <p className="text-sm text-muted-foreground">{formatCalendarDay(edition.date)}</p>}
        <h3 className="text-xl font-semibold">{edition.name}</h3>
        <MediaCountsLine counts={edition.counts} />
      </div>
      {(edition.aiSummary ?? edition.description) && (
        <p className="line-clamp-6 text-muted-foreground">{edition.aiSummary ?? edition.description}</p>
      )}
      {edition.previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {edition.previews.map((media) => (
            <div key={media.id} className="aspect-square overflow-hidden rounded-md bg-muted">
              <MediaPreview media={media} />
            </div>
          ))}
        </div>
      )}
      <Link href={`/activities/${edition.id}`} className="flex items-center gap-1 self-start text-sm font-medium text-primary hover:underline">
        Ver esta edición completa
        <ArrowRightIcon className="size-4" />
      </Link>
    </article>
  );
}

import type { SeriesTimelineDto } from "../../http/public-schemas";
import { EditionCard } from "./edition-card";

export function SeriesTimeline({ series }: { series: SeriesTimelineDto }) {
  return (
    <ol className="relative flex flex-col gap-8 border-l-2 border-border pl-6 sm:pl-8">
      {series.editions.map((edition) => (
        <li key={edition.id} className="relative">
          <span className="absolute top-1 -left-[33px] flex size-4 items-center justify-center rounded-full border-2 border-background bg-primary sm:-left-[41px]" />
          <p className="mb-3 font-heading text-2xl font-semibold text-primary">{edition.year}</p>
          <EditionCard edition={edition} />
        </li>
      ))}
    </ol>
  );
}

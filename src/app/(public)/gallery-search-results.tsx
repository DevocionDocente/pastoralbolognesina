import type { GalleryQuery } from "@/modules/activities/http/public-schemas";
import { GalleryResults } from "@/modules/activities/ui/gallery/gallery-results";
import type { GalleryParams, GalleryView } from "@/modules/activities/ui/gallery/gallery-url";
import { SeriesMatchBanner } from "@/modules/activities/ui/gallery/series-match-banner";
import { container } from "@/server/container";

interface GallerySearchResultsProps {
  query: GalleryQuery;
  view: GalleryView;
  params: GalleryParams;
  filtered: boolean;
}

export async function GallerySearchResults({ query, view, params, filtered }: GallerySearchResultsProps) {
  const { publicGallery, search } = container();
  if (!query.q) {
    return view === "media" ? (
      <GalleryResults view="media" page={await publicGallery.media(query)} params={params} filtered={filtered} />
    ) : (
      <GalleryResults view="activities" page={await publicGallery.activities(query)} params={params} filtered={filtered} />
    );
  }
  const found = await search.run({ ...query, q: query.q, view });
  return (
    <>
      <SeriesMatchBanner series={found.series} />
      {found.media ? (
        <GalleryResults view="media" page={found.media} params={params} filtered />
      ) : (
        <GalleryResults view="activities" page={found.activities!} params={params} filtered />
      )}
    </>
  );
}

import { Suspense } from "react";
import { GalleryQuerySchema } from "@/modules/activities/http/public-schemas";
import { GalleryFilters } from "@/modules/activities/ui/gallery/gallery-filters";
import { GalleryHero } from "@/modules/activities/ui/gallery/gallery-hero";
import type { GalleryParams, GalleryView } from "@/modules/activities/ui/gallery/gallery-url";
import { SearchingNotice } from "@/modules/activities/ui/gallery/searching-notice";
import { ViewTabs } from "@/modules/activities/ui/gallery/view-tabs";
import { container } from "@/server/container";
import { GallerySearchResults } from "./gallery-search-results";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parse(raw: Record<string, string | string[] | undefined>) {
  const single = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  const parsed = GalleryQuerySchema.safeParse(single);
  const query = parsed.success ? parsed.data : GalleryQuerySchema.parse({});
  const view: GalleryView = single.view === "media" ? "media" : "activities";
  return { query, view, params: { ...query, view } as GalleryParams };
}

export default async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const { query, view, params } = parse(await searchParams);
  const filtered = Boolean(query.q || query.from || query.to || query.series || query.kind || query.category || query.virtue);
  const facets = await container().publicGalleryService.facets();

  return (
    <>
      <GalleryHero params={params} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-4">
          <ViewTabs params={params} />
          <GalleryFilters params={params} facets={facets} />
        </div>
        <Suspense key={JSON.stringify(params)} fallback={<SearchingNotice query={query.q} />}>
          <GallerySearchResults query={query} view={view} params={params} filtered={filtered} />
        </Suspense>
      </main>
    </>
  );
}

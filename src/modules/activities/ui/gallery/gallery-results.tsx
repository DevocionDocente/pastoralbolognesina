import type { MediaDto } from "../../http/activity-schemas";
import type { ActivityCardDto, GalleryMediaDto, PageDto } from "../../http/public-schemas";
import { ActivityCard } from "./activity-card";
import { EmptyResults } from "./empty-results";
import { GalleryMediaGrid } from "./gallery-media-grid";
import { GalleryPagination } from "./gallery-pagination";
import type { GalleryParams } from "./gallery-url";

type GalleryResultsProps = { params: GalleryParams; filtered: boolean } & (
  | { view: "activities"; page: PageDto<ActivityCardDto & { highlights?: MediaDto[] }> }
  | { view: "media"; page: PageDto<GalleryMediaDto & { evidence?: string | null; second?: number | null }> }
);

export function GalleryResults(props: GalleryResultsProps) {
  const { page, params, filtered } = props;
  if (page.total === 0) return <EmptyResults filtered={filtered} />;

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted-foreground">
        {page.total} {props.view === "activities" ? (page.total === 1 ? "actividad" : "actividades") : page.total === 1 ? "archivo" : "archivos"}
      </p>
      {props.view === "activities" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {props.page.items.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <GalleryMediaGrid media={props.page.items} />
      )}
      <GalleryPagination params={params} page={page.page} pageCount={page.pageCount} />
    </div>
  );
}

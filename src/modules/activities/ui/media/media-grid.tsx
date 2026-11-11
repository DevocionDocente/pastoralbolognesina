import type { MediaDto } from "../../http/activity-schemas";
import { MediaCard } from "./media-card";

const SECTIONS: { title: string; kinds: MediaDto["kind"][] }[] = [
  { title: "Fotos", kinds: ["photo"] },
  { title: "Videos", kinds: ["video", "youtube"] },
  { title: "Documentos", kinds: ["document"] },
];

interface MediaGridProps {
  media: MediaDto[];
  canEditMedia: boolean;
  deletableIds: string[];
}

export function MediaGrid({ media, canEditMedia, deletableIds }: MediaGridProps) {
  if (media.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Esta actividad todavía no tiene archivos.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {SECTIONS.map((section) => {
        const items = media.filter((item) => section.kinds.includes(item.kind));
        if (items.length === 0) return null;
        return (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              {section.title} <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <MediaCard key={item.id} media={item} canEdit={canEditMedia} canDelete={deletableIds.includes(item.id)} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

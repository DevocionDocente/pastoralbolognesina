import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { galleryHref, type GalleryParams, type GalleryView } from "./gallery-url";

const VIEWS: { view: GalleryView; label: string }[] = [
  { view: "activities", label: "Por actividad" },
  { view: "media", label: "Fotos, videos y documentos" },
];

export function ViewTabs({ params }: { params: GalleryParams }) {
  const current = params.view ?? "activities";
  return (
    <nav aria-label="Vista" className="inline-flex rounded-lg bg-muted p-1">
      {VIEWS.map(({ view, label }) => (
        <Link
          key={view}
          href={galleryHref(params, { view, page: 1 })}
          aria-current={current === view ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
            current === view && "bg-card text-foreground shadow-sm",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

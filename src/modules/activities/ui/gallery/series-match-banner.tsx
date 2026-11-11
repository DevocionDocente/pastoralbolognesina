import Link from "next/link";
import { HistoryIcon } from "lucide-react";
import type { SeriesMatchDto } from "../../http/public-schemas";

export function SeriesMatchBanner({ series }: { series: SeriesMatchDto[] }) {
  if (series.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {series.map((item) => (
        <Link
          key={item.id}
          href={`/series/${item.id}`}
          className="flex flex-col gap-2 rounded-xl border bg-accent/40 p-4 transition-colors hover:bg-accent/60 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-center gap-3">
            <HistoryIcon className="size-5 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="font-semibold">{item.name}</span> tiene {item.years.length}{" "}
              {item.years.length === 1 ? "edición" : "ediciones"}: {item.years.join(", ")}
            </span>
          </span>
          <span className="text-sm font-medium text-primary">Comparar cómo se vivió cada año →</span>
        </Link>
      ))}
    </div>
  );
}

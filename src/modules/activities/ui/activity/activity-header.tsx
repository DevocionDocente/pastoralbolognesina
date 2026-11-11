import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { formatCalendarDay } from "@/shared/lib/format";
import type { ActivityDetailDto, SeriesDto } from "../../http/activity-schemas";
import { ActivityActions } from "./activity-actions";
import { PublicationBadge } from "./publication-badge";

export function ActivityHeader({ activity, series }: { activity: ActivityDetailDto; series: SeriesDto[] }) {
  const meta = [
    activity.series?.name,
    activity.date ? formatCalendarDay(activity.date) : String(activity.year),
    activity.createdBy && `Registrada por ${activity.createdBy.name}`,
  ].filter(Boolean);

  return (
    <header className="flex flex-col gap-4">
      <Link href="/dashboard/activities" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeftIcon className="size-4" />
        Actividades
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{activity.name}</h1>
            <PublicationBadge published={activity.published} />
          </div>
          <p className="text-sm text-muted-foreground">{meta.join(" · ")}</p>
          {activity.description && <p className="max-w-2xl whitespace-pre-line">{activity.description}</p>}
        </div>
        <ActivityActions activity={activity} series={series} />
      </div>
    </header>
  );
}

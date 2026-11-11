import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeftIcon, HistoryIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { PublicActivityDetailDto } from "../../http/public-schemas";
import { ActivitySummaryCard } from "../analysis/activity-summary-card";
import { activityWhen } from "./activity-when";

export function PublicActivityHeader({ activity, children }: { activity: PublicActivityDetailDto; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4">
      <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeftIcon className="size-4" />
        Todas las actividades
      </Link>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {[activity.series?.name, activityWhen(activity)].filter(Boolean).join(" · ")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{activity.name}</h1>
        {activity.description && <p className="max-w-3xl text-lg whitespace-pre-line text-muted-foreground">{activity.description}</p>}
      </div>
      {children}
      <div className="max-w-3xl">
        <ActivitySummaryCard summary={activity.aiSummary} title="Resumen de la actividad" />
      </div>
      {activity.series && (
        <Button asChild variant="outline" className="self-start">
          <Link href={`/series/${activity.series.id}`}>
            <HistoryIcon />
            Ver {activity.series.name} de otros años
          </Link>
        </Button>
      )}
    </header>
  );
}

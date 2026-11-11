import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import type { MediaDto } from "../../http/activity-schemas";
import type { ActivityCardDto } from "../../http/public-schemas";
import { activityWhen } from "./activity-when";
import { ActivityCardCover } from "./activity-card-cover";
import { CardVirtues } from "./card-virtues";
import { MatchHighlights } from "./match-highlights";
import { MediaCountsLine } from "./media-counts-line";

export function ActivityCard({ activity }: { activity: ActivityCardDto & { highlights?: MediaDto[] } }) {
  const { profile } = activity;
  return (
    <Link
      href={`/activities/${activity.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      <ActivityCardCover imageUrl={profile?.imageUrl ?? null} cover={activity.cover} name={activity.name} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{activityWhen(activity)}</span>
          {activity.series && <Badge variant="secondary">{activity.series.name}</Badge>}
        </div>
        <h2 className="text-lg leading-snug font-semibold">{activity.name}</h2>
        {profile?.pastoralDescription && <p className="line-clamp-3 text-sm leading-relaxed">{profile.pastoralDescription}</p>}
        {profile && <CardVirtues virtues={profile.virtues} />}
        {profile?.coexistenceImpact && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Convivencia: </span>
            {profile.coexistenceImpact}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-2">
          <MediaCountsLine counts={activity.counts} />
          {activity.highlights && <MatchHighlights media={activity.highlights} />}
        </div>
      </div>
    </Link>
  );
}

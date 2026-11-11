import type { Metadata } from "next";
import { toActivityDto } from "@/modules/activities/http/activity-mappers";
import { ActivitySearch } from "@/modules/activities/ui/activity/activity-search";
import { ActivityTable } from "@/modules/activities/ui/activity/activity-table";
import { CreateActivityButton } from "@/modules/activities/ui/activity/create-activity-button";
import { container } from "@/server/container";
import { CONTENT_PERMISSIONS } from "@/modules/auth/domain/permissions";
import { requireAnyPermission } from "@/server/current-profile";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata: Metadata = { title: "Actividades" };

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const profile = await requireAnyPermission(CONTENT_PERMISSIONS);
  const { q } = await searchParams;
  const { activityService } = container();
  const [activities, series] = await Promise.all([
    activityService.list(profile.id, q),
    activityService.listSeries(profile.id),
  ]);

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Actividades pastorales"
        description="Registra cada actividad y sube sus fotos, videos y documentos."
        actions={profile.permissions.includes("activities.create") && <CreateActivityButton series={series} />}
      />
      <ActivitySearch query={q} />
      <ActivityTable activities={activities.map(toActivityDto)} />
    </section>
  );
}

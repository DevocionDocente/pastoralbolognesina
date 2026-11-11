import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { toActivityDto, toMediaDto } from "@/modules/activities/http/activity-mappers";
import { ActivityHeader } from "@/modules/activities/ui/activity/activity-header";
import { ActivitySummaryCard } from "@/modules/activities/ui/analysis/activity-summary-card";
import { AnalysisAutoRefresh } from "@/modules/activities/ui/analysis/analysis-auto-refresh";
import { PastoralProfileSection } from "@/modules/activities/ui/profile/pastoral-profile-section";
import { MediaGrid } from "@/modules/activities/ui/media/media-grid";
import { MediaUploader } from "@/modules/activities/ui/upload/media-uploader";
import { container } from "@/server/container";
import { CONTENT_PERMISSIONS } from "@/modules/auth/domain/permissions";
import { requireAnyPermission } from "@/server/current-profile";
import { orNotFound } from "@/shared/lib/not-found-guard";

export const metadata: Metadata = { title: "Actividad" };

async function loadActivity(profileId: string, id: string) {
  const { activityService, mediaService, mediaUrlResolver, profileEditorService, virtueCatalogService, profilePresenter } = container();
  const [detail, media, series, pastoral, virtues] = await Promise.all([
    activityService.get(profileId, id),
    mediaService.list(profileId, id),
    activityService.listSeries(profileId),
    profileEditorService.get(profileId, id),
    virtueCatalogService.list(profileId),
  ]);
  const mediaDtos = await Promise.all(media.map(async (item) => toMediaDto(item, await mediaUrlResolver.resolve(item))));
  const deletableMediaIds = media
    .filter((item) => detail.canDeleteAnyMedia || (detail.canUpload && item.uploadedBy === profileId))
    .map((item) => item.id);
  const catalog = virtues.map((virtue) => virtue.name);
  return { detail, media: mediaDtos, deletableMediaIds, series, pastoral: await profilePresenter.profile(pastoral), catalog };
}

export default async function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireAnyPermission(CONTENT_PERMISSIONS);
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { detail, media, deletableMediaIds, series, pastoral, catalog } = await orNotFound(() => loadActivity(profile.id, id));
  const { activity: record, ...capabilities } = detail;
  const activity = { ...toActivityDto(record), ...capabilities };
  const analyzing = media.some((item) => item.analysisStatus === "pending" || item.analysisStatus === "processing");
  const profiling = pastoral.status === "processing" || (pastoral.status === "pending" && media.length > 0);

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8">
      <ActivityHeader activity={activity} series={series} />
      <PastoralProfileSection
        activityId={activity.id}
        activityName={activity.name}
        profile={pastoral}
        canEdit={activity.canEditProfile}
        catalog={catalog}
      />
      <ActivitySummaryCard summary={activity.aiSummary} />
      <AnalysisAutoRefresh active={analyzing || profiling} />
      {activity.canUpload && <MediaUploader activityId={activity.id} />}
      <MediaGrid media={media} canEditMedia={activity.canEditMedia} deletableIds={deletableMediaIds} />
    </section>
  );
}

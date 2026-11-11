import type { Metadata } from "next";
import { AnalysisAutoRefresh } from "@/modules/activities/ui/analysis/analysis-auto-refresh";
import { CreateVirtueButton } from "@/modules/activities/ui/virtues/create-virtue-button";
import { VirtueCard } from "@/modules/activities/ui/virtues/virtue-card";
import { container } from "@/server/container";
import { requirePermission } from "@/server/current-profile";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata: Metadata = { title: "Catálogo de virtudes" };

export default async function VirtuesPage() {
  const profile = await requirePermission("virtues.manage");
  const { virtueCatalogService, profilePresenter } = container();
  const virtues = await Promise.all((await virtueCatalogService.list(profile.id)).map((virtue) => profilePresenter.virtueUsage(virtue)));
  const generating = virtues.some((virtue) => !virtue.imageUrl || !virtue.explanation);

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Catálogo de virtudes"
        description="Virtudes cristianas que promueven las actividades. Se comparten entre actividades para no repetirse."
        actions={<CreateVirtueButton />}
      />
      <AnalysisAutoRefresh active={generating} />
      {virtues.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay virtudes. La IA las agrega al preparar el perfil pastoral de cada actividad.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {virtues.map((virtue) => (
            <VirtueCard key={virtue.id} virtue={virtue} />
          ))}
        </div>
      )}
    </section>
  );
}

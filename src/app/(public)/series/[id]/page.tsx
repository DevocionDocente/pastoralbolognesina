import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { SeriesTimeline } from "@/modules/activities/ui/gallery/series-timeline";
import { container } from "@/server/container";
import { orNotFound } from "@/shared/lib/not-found-guard";

type Params = Promise<{ id: string }>;

async function load(params: Params) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  return orNotFound(() => container().publicGallery.series(id));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const series = await load(params);
  return { title: `${series.name} a través de los años` };
}

export default async function SeriesPage({ params }: { params: Params }) {
  const series = await load(params);
  const years = series.editions.map((edition) => edition.year);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8">
      <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeftIcon className="size-4" />
        Todas las actividades
      </Link>
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Actividad recurrente</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{series.name}</h1>
        <p className="text-lg text-muted-foreground">
          {series.editions.length === 1
            ? `Una edición registrada (${years[0]}).`
            : `${series.editions.length} ediciones, de ${years[0]} a ${years.at(-1)}. Compara cómo se vivió cada año.`}
        </p>
      </header>
      <SeriesTimeline series={series} />
    </main>
  );
}

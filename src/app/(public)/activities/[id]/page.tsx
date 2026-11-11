import type { Metadata } from "next";
import { z } from "zod";
import { notFound } from "next/navigation";
import { ActivityMediaSections } from "@/modules/activities/ui/gallery/activity-media-sections";
import { PublicActivityHeader } from "@/modules/activities/ui/gallery/public-activity-header";
import { PublicPastoralSection } from "@/modules/activities/ui/gallery/public-pastoral-section";
import { container } from "@/server/container";
import { orNotFound } from "@/shared/lib/not-found-guard";

type Params = Promise<{ id: string }>;

async function load(params: Params) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  return orNotFound(() => container().publicGallery.activity(id));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const activity = await load(params);
  const description = activity.profile?.pastoralDescription ?? activity.description ?? undefined;
  const image = activity.profile?.imageUrl;
  return {
    title: activity.name,
    description,
    ...(image && {
      openGraph: { title: activity.name, description, images: [{ url: image, width: 1536, height: 1024, alt: activity.name }] },
    }),
  };
}

export default async function PublicActivityPage({ params }: { params: Params }) {
  const activity = await load(params);
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8">
      <PublicActivityHeader activity={activity}>
        <PublicPastoralSection profile={activity.profile} activityName={activity.name} />
      </PublicActivityHeader>
      <ActivityMediaSections media={activity.media} />
    </main>
  );
}

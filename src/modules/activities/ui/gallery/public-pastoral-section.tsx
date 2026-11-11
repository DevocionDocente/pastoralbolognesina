import type { PublicProfileDto } from "../../http/public-schemas";
import { ReflectionImage } from "../profile/reflection-image";
import { VirtueButtons } from "./virtue-buttons";

export function PublicPastoralSection({ profile, activityName }: { profile: PublicProfileDto | null; activityName: string }) {
  if (!profile?.pastoralDescription && !profile?.imageUrl) return null;
  return (
    <section className="overflow-hidden rounded-2xl border bg-card lg:grid lg:grid-cols-2">
      <ReflectionImage url={profile.imageUrl} alt={`Imagen de reflexión de ${activityName}`} className="lg:aspect-auto lg:h-full" />
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        {profile.pastoralDescription && <p className="text-lg leading-relaxed text-balance">{profile.pastoralDescription}</p>}
        {profile.virtues.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Virtudes que promueve</h2>
            <VirtueButtons virtues={profile.virtues} />
          </div>
        )}
        {profile.coexistenceImpact && (
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Impacto en la convivencia escolar</h2>
            <p className="leading-relaxed">{profile.coexistenceImpact}</p>
          </div>
        )}
      </div>
    </section>
  );
}

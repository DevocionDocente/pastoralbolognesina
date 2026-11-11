import type { ProfileDto } from "../../http/profile-schemas";
import { ProfileActions } from "./profile-actions";
import { ProfileStatusNote } from "./profile-status-note";
import { ProfileText } from "./profile-text";
import { ReflectionImage } from "./reflection-image";
import { VirtueChips } from "./virtue-chips";

interface PastoralProfileSectionProps {
  activityId: string;
  activityName: string;
  profile: ProfileDto;
  canEdit: boolean;
  catalog: string[];
}

export function PastoralProfileSection({ activityId, activityName, profile, canEdit, catalog }: PastoralProfileSectionProps) {
  const manual = new Set(profile.manualFields);
  return (
    <section className="overflow-hidden rounded-xl border bg-card md:grid md:grid-cols-[2fr_3fr]">
      <ReflectionImage url={profile.imageUrl} alt={`Imagen de reflexión de ${activityName}`} manual={manual.has("reflectionImage")} className="md:aspect-auto md:h-full" />
      <div className="flex flex-col gap-4 p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Perfil pastoral</h2>
            <ProfileStatusNote status={profile.status} />
          </div>
          {canEdit && <ProfileActions activityId={activityId} profile={profile} catalog={catalog} />}
        </header>
        <ProfileText label="Descripción pastoral" text={profile.pastoralDescription} manual={manual.has("pastoralDescription")} />
        <VirtueChips activityId={activityId} virtues={profile.virtues} manual={manual.has("virtues")} canEdit={canEdit} />
        <ProfileText label="Impacto en la convivencia escolar" text={profile.coexistenceImpact} manual={manual.has("coexistenceImpact")} />
      </div>
    </section>
  );
}

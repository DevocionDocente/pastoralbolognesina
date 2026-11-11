import { Badge } from "@/shared/ui/badge";
import type { VirtueUsageDto } from "../../http/profile-schemas";
import { ReflectionImage } from "../profile/reflection-image";
import { VirtueCardActions } from "./virtue-card-actions";

export function VirtueCard({ virtue }: { virtue: VirtueUsageDto }) {
  const usage = virtue.activityCount === 1 ? "1 actividad" : `${virtue.activityCount} actividades`;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <ReflectionImage url={virtue.imageUrl} alt={`Imagen de reflexión sobre ${virtue.name}`} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <header className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">{virtue.name}</h2>
            <Badge variant="secondary">{usage}</Badge>
          </div>
          <VirtueCardActions virtue={virtue} />
        </header>
        <p className="text-sm leading-relaxed text-muted-foreground">{virtue.explanation || "La IA está escribiendo la explicación…"}</p>
      </div>
    </article>
  );
}

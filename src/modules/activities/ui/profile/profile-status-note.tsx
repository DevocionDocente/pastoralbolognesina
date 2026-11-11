import { LoaderCircleIcon } from "lucide-react";
import type { ProfileDto } from "../../http/profile-schemas";

const NOTES: Record<ProfileDto["status"], string | null> = {
  pending: "La IA lo preparará cuando termine de analizar los archivos.",
  processing: "La IA está preparando el perfil…",
  ready: null,
  error: "La IA no pudo preparar el perfil. Puedes regenerarlo o completarlo a mano.",
};

export function ProfileStatusNote({ status }: { status: ProfileDto["status"] }) {
  const note = NOTES[status];
  if (!note) return <p className="text-sm text-muted-foreground">Generado con IA; puedes editar cada parte.</p>;
  return (
    <p className={status === "error" ? "text-sm text-destructive" : "flex items-center gap-2 text-sm text-muted-foreground"}>
      {status === "processing" && <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />}
      {note}
    </p>
  );
}

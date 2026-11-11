import { PencilLineIcon } from "lucide-react";

export function ManualMark() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground" title="Editado a mano; la IA no lo cambiará">
      <PencilLineIcon className="size-3" aria-hidden />
      Editado
    </span>
  );
}

"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import type { DialogControl } from "@/shared/ui/dialog-control";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { VirtueDto } from "../../http/profile-schemas";
import { virtueApi } from "../api/virtue-api";

export function DeleteVirtueDialog({ virtue, ...control }: DialogControl & { virtue: VirtueDto }) {
  const { run, pending } = useMutation(() => virtueApi.delete(virtue.id), {
    success: "Virtud eliminada.",
    onSuccess: () => control.onOpenChange(false),
  });

  return (
    <FormDialog
      {...control}
      title={`Eliminar ${virtue.name}`}
      description="Esta acción no se puede deshacer. Solo se pueden eliminar virtudes que ninguna actividad promueve."
      submitLabel="Eliminar"
      destructive
      pending={pending}
      onSubmit={() => run()}
    />
  );
}

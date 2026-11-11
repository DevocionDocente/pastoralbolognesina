"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { DialogControl } from "@/shared/ui/dialog-control";
import type { MediaDto } from "../../http/activity-schemas";
import { activityApi } from "../api/activity-api";

export function DeleteMediaDialog({ media, ...control }: DialogControl & { media: MediaDto }) {
  const { run, pending } = useMutation(() => activityApi.deleteMedia(media.id), {
    success: "Archivo eliminado.",
    onSuccess: () => control.onOpenChange(false),
  });

  return (
    <FormDialog
      {...control}
      title="Eliminar archivo"
      description={`Se eliminará «${media.originalName}». Esta acción no se puede deshacer.`}
      submitLabel="Eliminar"
      destructive
      pending={pending}
      onSubmit={() => run()}
    />
  );
}

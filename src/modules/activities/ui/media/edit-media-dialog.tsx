"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import { FormDialog } from "@/shared/ui/form-dialog";
import { FormField } from "@/shared/ui/form-field";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import type { DialogControl } from "@/shared/ui/dialog-control";
import type { MediaDto } from "../../http/activity-schemas";
import { activityApi } from "../api/activity-api";

const optional = (value: FormDataEntryValue | null) => String(value ?? "").trim() || null;

export function EditMediaDialog({ media, ...control }: DialogControl & { media: MediaDto }) {
  const { run, pending } = useMutation(
    (form: FormData) =>
      activityApi.updateMedia(media.id, { title: optional(form.get("title")), description: optional(form.get("description")) }),
    { success: "Detalles guardados.", onSuccess: () => control.onOpenChange(false) },
  );

  return (
    <FormDialog
      {...control}
      title="Detalles del archivo"
      description={media.originalName}
      submitLabel="Guardar"
      pending={pending}
      onSubmit={run}
    >
      <FormField name="title" label="Título (opcional)" defaultValue={media.title ?? ""} maxLength={200} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea id="description" name="description" defaultValue={media.description ?? ""} maxLength={2000} />
      </div>
    </FormDialog>
  );
}

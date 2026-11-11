"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import type { DialogControl } from "@/shared/ui/dialog-control";
import { FormDialog } from "@/shared/ui/form-dialog";
import { SelectField } from "@/shared/ui/select-field";
import { isMediaCategory } from "../../domain/media-category";
import type { MediaDto } from "../../http/activity-schemas";
import { activityApi } from "../api/activity-api";
import { CATEGORY_OPTIONS } from "../labels";

export function ChangeCategoryDialog({ media, ...control }: DialogControl & { media: MediaDto }) {
  const { run, pending } = useMutation(
    async (form: FormData) => {
      const category = String(form.get("category"));
      if (isMediaCategory(category)) await activityApi.setCategory(media.id, category);
    },
    { success: "Tipo de archivo actualizado.", onSuccess: () => control.onOpenChange(false) },
  );

  return (
    <FormDialog
      {...control}
      title="Tipo de archivo"
      description="Las familias pueden filtrar la galería por este tipo. Si lo cambias, la IA ya no lo modificará."
      submitLabel="Guardar"
      pending={pending}
      onSubmit={run}
    >
      <SelectField name="category" label="Tipo" placeholder="Elige un tipo" options={CATEGORY_OPTIONS} defaultValue={media.category} required />
    </FormDialog>
  );
}

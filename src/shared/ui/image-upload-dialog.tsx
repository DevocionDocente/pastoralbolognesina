"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import type { DialogControl } from "./dialog-control";
import { FormDialog } from "./form-dialog";
import { FormField } from "./form-field";

interface ImageUploadDialogProps extends DialogControl {
  title: string;
  description: string;
  onUpload: (file: File) => Promise<unknown>;
}

export function ImageUploadDialog({ title, description, onUpload, ...control }: ImageUploadDialogProps) {
  const { run, pending } = useMutation(
    async (form: FormData) => {
      const file = form.get("image");
      if (file instanceof File && file.size > 0) await onUpload(file);
    },
    { success: "Imagen reemplazada.", onSuccess: () => control.onOpenChange(false) },
  );

  return (
    <FormDialog {...control} title={title} description={description} submitLabel="Subir imagen" pending={pending} onSubmit={run}>
      <FormField name="image" label="Imagen (JPG, PNG o WEBP, hasta 15 MB)" type="file" accept="image/jpeg,image/png,image/webp" required />
    </FormDialog>
  );
}

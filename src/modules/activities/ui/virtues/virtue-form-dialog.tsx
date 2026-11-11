"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import type { DialogControl } from "@/shared/ui/dialog-control";
import { FormDialog } from "@/shared/ui/form-dialog";
import { FormField } from "@/shared/ui/form-field";
import { TextareaField } from "@/shared/ui/textarea-field";
import type { VirtueDto } from "../../http/profile-schemas";
import { virtueApi } from "../api/virtue-api";

const text = (value: FormDataEntryValue | null) => String(value ?? "").trim();

export function VirtueFormDialog({ virtue, ...control }: DialogControl & { virtue?: VirtueDto }) {
  const { run, pending } = useMutation(
    (form: FormData) => {
      const input = { name: text(form.get("name")), explanation: text(form.get("explanation")) };
      return virtue ? virtueApi.update(virtue.id, input) : virtueApi.create(input);
    },
    { success: virtue ? "Virtud actualizada." : "Virtud agregada al catálogo.", onSuccess: () => control.onOpenChange(false) },
  );

  return (
    <FormDialog
      {...control}
      title={virtue ? `Editar ${virtue.name}` : "Nueva virtud"}
      description={virtue ? "El cambio se refleja en todas las actividades que la promueven." : "Si dejas la explicación vacía, la IA la escribe y dibuja su imagen."}
      submitLabel="Guardar"
      pending={pending}
      onSubmit={run}
    >
      <FormField name="name" label="Nombre" defaultValue={virtue?.name ?? ""} minLength={2} maxLength={60} required />
      <TextareaField
        name="explanation"
        label={virtue ? "Explicación para las familias" : "Explicación para las familias (opcional)"}
        defaultValue={virtue?.explanation ?? ""}
        rows={4}
        maxLength={1000}
        required={Boolean(virtue)}
      />
    </FormDialog>
  );
}

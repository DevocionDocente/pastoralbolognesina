"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import type { DialogControl } from "@/shared/ui/dialog-control";
import { FormDialog } from "@/shared/ui/form-dialog";
import { TextareaField } from "@/shared/ui/textarea-field";
import type { ProfileDto } from "../../http/profile-schemas";
import { activityApi } from "../api/activity-api";

const text = (value: FormDataEntryValue | null) => String(value ?? "").trim();

export function EditProfileTextsDialog({ activityId, profile, ...control }: DialogControl & { activityId: string; profile: ProfileDto }) {
  const { run, pending } = useMutation(
    (form: FormData) =>
      activityApi.updateProfile(activityId, {
        pastoralDescription: text(form.get("pastoralDescription")),
        coexistenceImpact: text(form.get("coexistenceImpact")),
      }),
    { success: "Perfil pastoral guardado.", onSuccess: () => control.onOpenChange(false) },
  );

  return (
    <FormDialog
      {...control}
      title="Textos del perfil pastoral"
      description="Lo que escribas aquí se muestra a las familias y la IA ya no lo cambiará."
      submitLabel="Guardar"
      pending={pending}
      onSubmit={run}
    >
      <TextareaField
        name="pastoralDescription"
        label="Descripción pastoral"
        defaultValue={profile.pastoralDescription ?? ""}
        rows={4}
        maxLength={2000}
        required
      />
      <TextareaField
        name="coexistenceImpact"
        label="Impacto en la convivencia escolar"
        defaultValue={profile.coexistenceImpact ?? ""}
        rows={4}
        maxLength={2000}
        required
      />
    </FormDialog>
  );
}

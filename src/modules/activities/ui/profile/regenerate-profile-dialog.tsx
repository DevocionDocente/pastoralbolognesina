"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import { Checkbox } from "@/shared/ui/checkbox";
import type { DialogControl } from "@/shared/ui/dialog-control";
import { FormDialog } from "@/shared/ui/form-dialog";
import { Label } from "@/shared/ui/label";
import { isProfileField, PROFILE_FIELDS } from "../../domain/pastoral-profile";
import { activityApi } from "../api/activity-api";
import { PROFILE_FIELD_LABELS } from "../labels";

export function RegenerateProfileDialog({ activityId, ...control }: DialogControl & { activityId: string }) {
  const { run, pending } = useMutation(
    async (form: FormData) => {
      const fields = form.getAll("fields").map(String).filter(isProfileField);
      if (fields.length > 0) await activityApi.regenerateProfile(activityId, fields);
    },
    { success: "La IA está regenerando el perfil. Tardará uno o dos minutos.", onSuccess: () => control.onOpenChange(false) },
  );

  return (
    <FormDialog
      {...control}
      title="Regenerar con IA"
      description="Lo que marques se vuelve a generar y reemplaza lo actual, aunque lo hayas editado a mano."
      submitLabel="Regenerar"
      pending={pending}
      onSubmit={run}
    >
      <fieldset className="flex flex-col gap-3">
        {PROFILE_FIELDS.map((field) => (
          <div key={field} className="flex items-center gap-3">
            <Checkbox id={`regenerate-${field}`} name="fields" value={field} />
            <Label htmlFor={`regenerate-${field}`} className="font-normal">
              {PROFILE_FIELD_LABELS[field]}
            </Label>
          </div>
        ))}
      </fieldset>
    </FormDialog>
  );
}

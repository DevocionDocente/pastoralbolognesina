"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import type { DialogControl } from "@/shared/ui/dialog-control";
import { FormDialog } from "@/shared/ui/form-dialog";
import { MAX_VIRTUES, MIN_VIRTUES } from "../../domain/pastoral-profile";
import type { ActivityVirtueDto } from "../../http/profile-schemas";
import { activityApi } from "../api/activity-api";
import { VirtueRowFields } from "./virtue-row-fields";

interface EditVirtuesDialogProps extends DialogControl {
  activityId: string;
  current: ActivityVirtueDto[];
  catalog: string[];
}

function readVirtues(form: FormData) {
  const explanations = form.getAll("virtueExplanation").map((value) => String(value).trim());
  return form
    .getAll("virtue")
    .map((value, index) => ({ name: String(value).trim(), explanation: explanations[index] || null }))
    .filter((virtue) => virtue.name);
}

export function EditVirtuesDialog({ activityId, current, catalog, ...control }: EditVirtuesDialogProps) {
  const { run, pending } = useMutation((form: FormData) => activityApi.setVirtues(activityId, readVirtues(form)), {
    success: "Virtudes actualizadas.",
    onSuccess: () => control.onOpenChange(false),
  });

  return (
    <FormDialog
      {...control}
      title="Virtudes que promueve"
      description={`Escribe entre ${MIN_VIRTUES} y ${MAX_VIRTUES} virtudes y, si quieres, cómo las promueve esta actividad. Elige del catálogo para no repetirlas.`}
      submitLabel="Guardar"
      pending={pending}
      onSubmit={run}
    >
      <datalist id="virtue-catalog">
        {catalog.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <div className="flex max-h-[55vh] flex-col gap-4 overflow-y-auto pr-1">
        {Array.from({ length: MAX_VIRTUES }, (_, index) => (
          <VirtueRowFields key={index} index={index} virtue={current[index]} required={index < MIN_VIRTUES} />
        ))}
      </div>
    </FormDialog>
  );
}

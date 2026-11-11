"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@/shared/hooks/use-mutation";
import type { DialogControl } from "@/shared/ui/dialog-control";
import { FormDialog } from "@/shared/ui/form-dialog";
import { FormField } from "@/shared/ui/form-field";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import type { ActivityDto, ActivityInputDto, SeriesDto } from "../../http/activity-schemas";
import { activityApi } from "../api/activity-api";
import { ActivityDateFields } from "./activity-date-fields";
import { SeriesField } from "./series-field";

const optional = (value: FormDataEntryValue | null) => String(value ?? "").trim() || null;

function toInput(form: FormData): ActivityInputDto {
  const date = optional(form.get("date"));
  return {
    name: String(form.get("name")).trim(),
    description: optional(form.get("description")),
    date,
    year: date ? null : Number(form.get("year")),
    seriesName: optional(form.get("seriesName")),
  };
}

interface ActivityFormDialogProps extends DialogControl {
  series: SeriesDto[];
  activity?: ActivityDto;
}

export function ActivityFormDialog({ series, activity, ...control }: ActivityFormDialogProps) {
  const router = useRouter();
  const { run, pending } = useMutation(
    async (form: FormData) => {
      if (activity) return activityApi.update(activity.id, toInput(form));
      const created = await activityApi.create(toInput(form));
      router.push(`/dashboard/activities/${created.id}`);
    },
    { success: activity ? "Actividad actualizada." : "Actividad creada.", onSuccess: () => control.onOpenChange(false) },
  );

  return (
    <FormDialog
      {...control}
      title={activity ? "Editar actividad" : "Nueva actividad"}
      submitLabel={activity ? "Guardar" : "Crear actividad"}
      pending={pending}
      onSubmit={run}
    >
      <FormField name="name" label="Nombre de la actividad" defaultValue={activity?.name} required maxLength={200} />
      <SeriesField series={series} defaultValue={activity?.series?.name} />
      <ActivityDateFields defaultDate={activity?.date ?? null} defaultYear={activity?.year ?? null} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea id="description" name="description" defaultValue={activity?.description ?? ""} rows={4} />
      </div>
    </FormDialog>
  );
}

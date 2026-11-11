"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@/shared/hooks/use-mutation";
import type { DialogControl } from "@/shared/ui/dialog-control";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { ActivityDto } from "../../http/activity-schemas";
import { activityApi } from "../api/activity-api";

export function DeleteActivityDialog({ activity, ...control }: DialogControl & { activity: ActivityDto }) {
  const router = useRouter();
  const { run, pending } = useMutation(
    async () => {
      await activityApi.delete(activity.id);
      router.push("/dashboard/activities");
    },
    { success: "Actividad eliminada." },
  );

  return (
    <FormDialog
      {...control}
      title="Eliminar actividad"
      description={`Se eliminará «${activity.name}» con sus ${activity.mediaCount} archivos. Esta acción no se puede deshacer.`}
      submitLabel="Eliminar"
      destructive
      pending={pending}
      onSubmit={() => run()}
    />
  );
}

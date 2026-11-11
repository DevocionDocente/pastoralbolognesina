"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import type { ActivityDetailDto, SeriesDto } from "../../http/activity-schemas";
import { ActivityFormDialog } from "./activity-form-dialog";
import { DeleteActivityDialog } from "./delete-activity-dialog";
import { PublishButton } from "./publish-button";

export function ActivityActions({ activity, series }: { activity: ActivityDetailDto; series: SeriesDto[] }) {
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);
  const control = (name: "edit" | "delete") => ({ open: dialog === name, onOpenChange: (open: boolean) => setDialog(open ? name : null) });

  return (
    <div className="flex flex-wrap gap-2">
      {activity.canEdit && <PublishButton activityId={activity.id} published={activity.published} />}
      {activity.canEdit && (
        <Button variant="outline" onClick={() => setDialog("edit")}>
          <PencilIcon />
          Editar
        </Button>
      )}
      {activity.canDelete && (
        <Button variant="outline" onClick={() => setDialog("delete")} aria-label="Eliminar actividad">
          <Trash2Icon />
        </Button>
      )}
      <ActivityFormDialog activity={activity} series={series} {...control("edit")} />
      <DeleteActivityDialog activity={activity} {...control("delete")} />
    </div>
  );
}

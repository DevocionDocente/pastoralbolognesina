import type { ActivityVirtueDto } from "../../http/profile-schemas";
import { VirtueButtons } from "../gallery/virtue-buttons";
import { EditableVirtueButtons } from "./editable-virtue-buttons";
import { ManualMark } from "./manual-mark";

interface VirtueChipsProps {
  activityId: string;
  virtues: ActivityVirtueDto[];
  manual: boolean;
  canEdit: boolean;
}

export function VirtueChips({ activityId, virtues, manual, canEdit }: VirtueChipsProps) {
  const buttons = canEdit ? <EditableVirtueButtons activityId={activityId} virtues={virtues} /> : <VirtueButtons virtues={virtues} />;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        Virtudes que promueve
        {manual && <ManualMark />}
      </h3>
      {virtues.length === 0 ? <p className="text-sm">Pendiente</p> : buttons}
    </div>
  );
}

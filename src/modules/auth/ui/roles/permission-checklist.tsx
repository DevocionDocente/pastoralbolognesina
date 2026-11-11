import type { ReactNode } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { PERMISSION_GROUPS, PERMISSION_LABELS } from "../../domain/permission-labels";
import type { Permission } from "../../domain/permissions";

interface PermissionChecklistProps {
  selected: readonly Permission[];
  hint?: (permission: Permission) => ReactNode;
}

export function PermissionChecklist({ selected, hint }: PermissionChecklistProps) {
  return (
    <div className="flex max-h-[55vh] flex-col gap-4 overflow-y-auto pr-1">
      {PERMISSION_GROUPS.map((group) => (
        <fieldset key={group.title} className="flex flex-col gap-2.5">
          <legend className="mb-1 text-sm font-medium">{group.title}</legend>
          {group.permissions.map((permission) => (
            <div key={permission} className="flex items-start gap-3">
              <Checkbox id={permission} name="permissions" value={permission} defaultChecked={selected.includes(permission)} />
              <Label htmlFor={permission} className="flex flex-col items-start gap-0.5 font-normal">
                {PERMISSION_LABELS[permission]}
                {hint?.(permission)}
              </Label>
            </div>
          ))}
        </fieldset>
      ))}
    </div>
  );
}

"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { RoleDto } from "../../http/role-schemas";
import { roleApi } from "../api/role-api";
import type { DialogControl } from "../users/types";

export function DeleteRoleDialog({ role, ...control }: DialogControl & { role: RoleDto }) {
  const { run, pending } = useMutation(() => roleApi.delete(role.id), {
    success: "Rol eliminado.",
    onSuccess: () => control.onOpenChange(false),
  });

  return (
    <FormDialog
      {...control}
      title={`Eliminar ${role.name}`}
      description="Esta acción no se puede deshacer. Solo se pueden eliminar roles sin usuarios asignados."
      submitLabel="Eliminar"
      destructive
      pending={pending}
      onSubmit={() => run()}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@/shared/hooks/use-mutation";
import { FormDialog } from "@/shared/ui/form-dialog";
import { isPermission } from "../../domain/permissions";
import type { UserDto, UserPermissionsDto } from "../../http/user-schemas";
import { userApi } from "../api/user-api";
import { PermissionChecklist } from "../roles/permission-checklist";
import { PermissionOrigin } from "./permission-origin";
import type { DialogControl } from "./types";

export function UserPermissionsDialog({ user, ...control }: DialogControl & { user: UserDto }) {
  const [permissions, setPermissions] = useState<UserPermissionsDto | null>(null);
  const { run, pending } = useMutation(
    (form: FormData) => userApi.setPermissions(user.id, form.getAll("permissions").map(String).filter(isPermission)),
    { success: "Permisos actualizados.", onSuccess: () => control.onOpenChange(false) },
  );

  useEffect(() => {
    if (!control.open) return;
    let cancelled = false;
    userApi.permissions(user.id).then((result) => !cancelled && setPermissions(result));
    return () => {
      cancelled = true;
    };
  }, [control.open, user.id]);

  return (
    <FormDialog
      {...control}
      title={`Permisos de ${user.name}`}
      description={`Parte de los permisos del rol ${user.role?.name ?? "asignado"}. Lo que cambies aquí solo afecta a esta persona.`}
      submitLabel="Guardar permisos"
      pending={pending || !permissions}
      onSubmit={run}
    >
      {permissions ? (
        <PermissionChecklist
          key={permissions.effective.join()}
          selected={permissions.effective}
          hint={(permission) => <PermissionOrigin permission={permission} permissions={permissions} />}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      )}
    </FormDialog>
  );
}

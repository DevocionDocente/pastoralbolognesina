"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import { FormDialog } from "@/shared/ui/form-dialog";
import { SelectField } from "@/shared/ui/select-field";
import type { UserDto } from "../../http/user-schemas";
import { userApi } from "../api/user-api";
import { roleOptions, type DialogControl, type RoleOption } from "./types";

const COPY = {
  pending: { title: "Aprobar solicitud", submit: "Aprobar", success: "Solicitud aprobada." },
  revoked: { title: "Restituir acceso", submit: "Restituir", success: "Acceso restituido." },
  active: { title: "Cambiar rol", submit: "Guardar", success: "Rol actualizado." },
};

interface GrantAccessDialogProps extends DialogControl {
  user: UserDto;
  roles: RoleOption[];
}

export function GrantAccessDialog({ user, roles, ...control }: GrantAccessDialogProps) {
  const copy = COPY[user.status];
  const { run, pending } = useMutation((form: FormData) => userApi.grant(user.id, String(form.get("roleId"))), {
    success: copy.success,
    onSuccess: () => control.onOpenChange(false),
  });

  return (
    <FormDialog
      {...control}
      title={copy.title}
      description={`Elige qué podrá hacer ${user.name} en el panel.`}
      submitLabel={copy.submit}
      pending={pending}
      onSubmit={run}
    >
      <SelectField
        name="roleId"
        label="Rol"
        placeholder="Elige un rol"
        options={roleOptions(roles)}
        defaultValue={user.role?.id}
        required
      />
    </FormDialog>
  );
}

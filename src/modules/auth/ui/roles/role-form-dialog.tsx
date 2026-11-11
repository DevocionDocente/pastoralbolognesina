"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import { FormDialog } from "@/shared/ui/form-dialog";
import { FormField } from "@/shared/ui/form-field";
import { isPermission } from "../../domain/permissions";
import type { RoleDto, RoleInputDto } from "../../http/role-schemas";
import { roleApi } from "../api/role-api";
import type { DialogControl } from "../users/types";
import { PermissionChecklist } from "./permission-checklist";

function toInput(form: FormData): RoleInputDto {
  const description = String(form.get("description") ?? "").trim();
  return {
    name: String(form.get("name")).trim(),
    description: description || null,
    permissions: form.getAll("permissions").map(String).filter(isPermission),
  };
}

export function RoleFormDialog({ role, ...control }: DialogControl & { role?: RoleDto }) {
  const { run, pending } = useMutation(
    (form: FormData) => (role ? roleApi.update(role.id, toInput(form)) : roleApi.create(toInput(form))),
    { success: role ? "Rol actualizado." : "Rol creado.", onSuccess: () => control.onOpenChange(false) },
  );

  return (
    <FormDialog
      {...control}
      title={role ? `Editar ${role.name}` : "Nuevo rol"}
      description="Marca lo que podrán hacer las personas con este rol."
      submitLabel={role ? "Guardar" : "Crear rol"}
      pending={pending}
      onSubmit={run}
    >
      <FormField name="name" label="Nombre" defaultValue={role?.name} readOnly={role?.isSystem} required />
      <FormField name="description" label="Descripción (opcional)" defaultValue={role?.description ?? ""} />
      <PermissionChecklist selected={role?.permissions ?? []} />
    </FormDialog>
  );
}

"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import { FormDialog } from "@/shared/ui/form-dialog";
import { FormField } from "@/shared/ui/form-field";
import type { UserDto } from "../../http/user-schemas";
import { userApi } from "../api/user-api";
import type { DialogControl } from "./types";

export function EditUserDialog({ user, ...control }: DialogControl & { user: UserDto }) {
  const { run, pending } = useMutation(
    (form: FormData) => userApi.update(user.id, { name: String(form.get("name")), email: String(form.get("email")) }),
    { success: "Datos actualizados.", onSuccess: () => control.onOpenChange(false) },
  );

  return (
    <FormDialog {...control} title="Editar datos" submitLabel="Guardar" pending={pending} onSubmit={run}>
      <FormField name="name" label="Nombre completo" defaultValue={user.name} required />
      <FormField name="email" type="email" label="Correo electrónico" defaultValue={user.email} required />
    </FormDialog>
  );
}

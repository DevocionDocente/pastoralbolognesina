"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import { FormDialog } from "@/shared/ui/form-dialog";
import { FormField } from "@/shared/ui/form-field";
import type { UserDto } from "../../http/user-schemas";
import { userApi } from "../api/user-api";
import type { DialogControl } from "./types";

export function ResetPasswordDialog({ user, ...control }: DialogControl & { user: UserDto }) {
  const { run, pending } = useMutation((form: FormData) => userApi.resetPassword(user.id, String(form.get("password"))), {
    success: "Contraseña restablecida.",
    onSuccess: () => control.onOpenChange(false),
  });

  return (
    <FormDialog
      {...control}
      title="Restablecer contraseña"
      description={`Entrega la nueva contraseña a ${user.name}. Sus sesiones abiertas se cerrarán.`}
      submitLabel="Restablecer"
      pending={pending}
      onSubmit={run}
    >
      <FormField name="password" type="text" label="Nueva contraseña" minLength={8} required />
    </FormDialog>
  );
}

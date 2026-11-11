"use client";

import { useMutation } from "@/shared/hooks/use-mutation";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { UserDto } from "../../http/user-schemas";
import { userApi } from "../api/user-api";
import type { DialogControl } from "./types";

export function RejectRequestDialog({ user, ...control }: DialogControl & { user: UserDto }) {
  const { run, pending } = useMutation(() => userApi.reject(user.id), {
    success: "Solicitud rechazada.",
    onSuccess: () => control.onOpenChange(false),
  });

  return (
    <FormDialog
      {...control}
      title="Rechazar solicitud"
      description={`Se eliminará la cuenta de ${user.name} (${user.email}). Podrá volver a registrarse si lo necesita.`}
      submitLabel="Rechazar"
      destructive
      pending={pending}
      onSubmit={() => run()}
    />
  );
}

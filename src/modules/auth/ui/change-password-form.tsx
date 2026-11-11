"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { authClient } from "@/shared/lib/auth-client";
import { Button } from "@/shared/ui/button";
import { FormError } from "@/shared/ui/form-error";
import { FormField } from "@/shared/ui/form-field";

export function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (form.get("newPassword") !== form.get("confirmation")) return setError("Las contraseñas nuevas no coinciden.");
    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword: String(form.get("currentPassword")),
      newPassword: String(form.get("newPassword")),
      revokeOtherSessions: true,
    });
    setPending(false);
    if (error) return setError("La contraseña actual no es correcta.");
    setError(null);
    formElement.reset();
    toast.success("Contraseña actualizada.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <FormField name="currentPassword" type="password" label="Contraseña actual" autoComplete="current-password" required />
      <FormField name="newPassword" type="password" label="Nueva contraseña" autoComplete="new-password" minLength={8} required />
      <FormField name="confirmation" type="password" label="Repite la nueva contraseña" autoComplete="new-password" minLength={8} required />
      <FormError message={error} />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}

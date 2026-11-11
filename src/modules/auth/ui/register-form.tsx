"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/shared/lib/auth-client";
import { Button } from "@/shared/ui/button";
import { FormError } from "@/shared/ui/form-error";
import { FormField } from "@/shared/ui/form-field";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    const { error } = await authClient.signUp.email({
      name: String(form.get("name")).trim(),
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setPending(false);
    if (error) return setError("No se pudo registrar. Es posible que ese correo ya tenga una cuenta.");
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField name="name" label="Nombre completo" autoComplete="name" required />
      <FormField name="email" type="email" label="Correo electrónico" autoComplete="email" required />
      <FormField name="password" type="password" label="Contraseña" autoComplete="new-password" minLength={8} required />
      <FormError message={error} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Enviando…" : "Solicitar acceso"}
      </Button>
    </form>
  );
}

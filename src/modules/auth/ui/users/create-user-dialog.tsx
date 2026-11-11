"use client";

import { UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@/shared/hooks/use-mutation";
import { Button } from "@/shared/ui/button";
import { FormDialog } from "@/shared/ui/form-dialog";
import { FormField } from "@/shared/ui/form-field";
import { SelectField } from "@/shared/ui/select-field";
import { userApi } from "../api/user-api";
import { roleOptions, type RoleOption } from "./types";

export function CreateUserDialog({ roles }: { roles: RoleOption[] }) {
  const [open, setOpen] = useState(false);
  const { run, pending } = useMutation(
    (form: FormData) =>
      userApi.create({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        roleId: String(form.get("roleId")),
      }),
    { success: "Usuario creado.", onSuccess: () => setOpen(false) },
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlusIcon />
        Nuevo usuario
      </Button>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nuevo usuario"
        description="La persona podrá ingresar de inmediato con este correo y contraseña."
        submitLabel="Crear usuario"
        pending={pending}
        onSubmit={run}
      >
        <FormField name="name" label="Nombre completo" required />
        <FormField name="email" type="email" label="Correo electrónico" required />
        <FormField name="password" type="text" label="Contraseña inicial" minLength={8} required />
        <SelectField name="roleId" label="Rol" placeholder="Elige un rol" options={roleOptions(roles)} required />
      </FormDialog>
    </>
  );
}

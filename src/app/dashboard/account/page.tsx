import type { Metadata } from "next";
import { ChangePasswordForm } from "@/modules/auth/ui/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function AccountPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Mi cuenta" description="Administra tu acceso al panel." />
      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>Al cambiarla se cerrarán tus sesiones en otros dispositivos.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </section>
  );
}

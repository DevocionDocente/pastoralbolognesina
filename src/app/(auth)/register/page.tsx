import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/modules/auth/ui/auth-card";
import { RegisterForm } from "@/modules/auth/ui/register-form";

export const metadata: Metadata = { title: "Solicitar acceso" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Solicitar acceso"
      description="Para integrantes del equipo pastoral. Un administrador revisará tu solicitud. Las familias no necesitan registrarse."
      footer={
        <p>
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Inicia sesión
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}

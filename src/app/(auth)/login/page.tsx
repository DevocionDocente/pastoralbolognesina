import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/modules/auth/ui/auth-card";
import { LoginForm } from "@/modules/auth/ui/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Iniciar sesión"
      description="Acceso para el personal del área pastoral y profesores."
      footer={
        <p>
          ¿Eres integrante del equipo pastoral?{" "}
          <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Solicita acceso
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}

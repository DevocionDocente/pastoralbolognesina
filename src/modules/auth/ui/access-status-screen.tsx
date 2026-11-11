import Link from "next/link";
import { ClockIcon, ShieldOffIcon } from "lucide-react";
import type { UserProfile } from "../domain/user-profile";
import { BrandMark } from "@/shared/ui/brand-mark";
import { Button } from "@/shared/ui/button";
import { SignOutButton } from "./sign-out-button";

const COPY = {
  pending: {
    icon: ClockIcon,
    title: "Tu solicitud está en revisión",
    body: "Un administrador del área pastoral revisará tu solicitud y te asignará un rol. Vuelve a ingresar más tarde.",
  },
  revoked: {
    icon: ShieldOffIcon,
    title: "Tu acceso al panel fue retirado",
    body: "Ya no puedes gestionar actividades, pero puedes seguir viendo todo el sitio web como cualquier miembro de la comunidad.",
  },
};

export function AccessStatusScreen({ profile }: { profile: UserProfile }) {
  const copy = COPY[profile.status === "pending" ? "pending" : "revoked"];
  const Icon = copy.icon;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <BrandMark href="/" />
      <div className="flex max-w-md flex-col items-center gap-3">
        <Icon className="size-10 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-muted-foreground">Hola, {profile.name}. {copy.body}</p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Ir al sitio web</Link>
        </Button>
        <SignOutButton />
      </div>
    </main>
  );
}

import Link from "next/link";
import { BookOpenIcon, CalendarHeartIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface WelcomePanelProps {
  name: string;
  role: string | null;
  canRegisterActivities: boolean;
}

export function WelcomePanel({ name, role, canRegisterActivities }: WelcomePanelProps) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{role ?? "Sin rol asignado"}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Hola, {name}</h1>
        <p className="text-muted-foreground">
          Desde este panel puedes registrar las actividades pastorales del colegio y compartirlas con las familias.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {canRegisterActivities && (
          <Button asChild>
            <Link href="/dashboard/activities">
              <CalendarHeartIcon />
              Ir a las actividades
            </Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/manual" target="_blank">
            <BookOpenIcon />
            Ver el manual de usuario
          </Link>
        </Button>
      </div>
    </section>
  );
}

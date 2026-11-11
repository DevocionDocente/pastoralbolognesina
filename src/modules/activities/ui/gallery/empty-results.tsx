import Link from "next/link";
import { SearchXIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function EmptyResults({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
      <SearchXIcon className="size-8 text-muted-foreground" />
      <p className="font-medium">{filtered ? "No encontramos resultados" : "Todavía no hay actividades publicadas"}</p>
      {filtered && (
        <>
          <p className="text-sm text-muted-foreground">Prueba con otras palabras o quita algunos filtros.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Ver todo</Link>
          </Button>
        </>
      )}
    </div>
  );
}

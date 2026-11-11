import { LoaderCircleIcon } from "lucide-react";
import { Skeleton } from "@/shared/ui/skeleton";

export function SearchingNotice({ query }: { query?: string }) {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
        {query ? `Buscando «${query}» con inteligencia artificial…` : "Cargando actividades…"}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

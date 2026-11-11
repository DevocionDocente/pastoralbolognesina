import { SearchIcon } from "lucide-react";
import { Input } from "@/shared/ui/input";

export function ActivitySearch({ query }: { query?: string }) {
  return (
    <form role="search" className="relative max-w-sm">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input name="q" defaultValue={query} placeholder="Buscar por nombre" aria-label="Buscar actividades" className="pl-9" />
    </form>
  );
}

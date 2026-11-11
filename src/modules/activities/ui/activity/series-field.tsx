import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { SeriesDto } from "../../http/activity-schemas";

export function SeriesField({ series, defaultValue }: { series: SeriesDto[]; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="seriesName">Actividad recurrente (opcional)</Label>
      <Input id="seriesName" name="seriesName" list="series-options" defaultValue={defaultValue} placeholder="Por ejemplo: Semana Santa" />
      <datalist id="series-options">
        {series.map((item) => (
          <option key={item.id} value={item.name} />
        ))}
      </datalist>
      <p className="text-xs text-muted-foreground">
        Elige una de la lista o escribe un nombre nuevo. Así podrás comparar las ediciones de cada año.
      </p>
    </div>
  );
}

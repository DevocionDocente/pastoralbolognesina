import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type { ActivityVirtueDto } from "../../http/profile-schemas";

interface VirtueRowFieldsProps {
  index: number;
  virtue?: ActivityVirtueDto;
  required: boolean;
}

export function VirtueRowFields({ index, virtue, required }: VirtueRowFieldsProps) {
  const label = `Virtud ${index + 1}`;
  return (
    <fieldset className="flex flex-col gap-2 rounded-lg border p-3">
      <legend className="px-1 text-sm font-medium">{required ? label : `${label} (opcional)`}</legend>
      <Input
        name="virtue"
        list="virtue-catalog"
        aria-label={label}
        placeholder="Nombre, por ejemplo: Servicio"
        defaultValue={virtue?.name ?? ""}
        required={required}
        maxLength={60}
      />
      <Textarea
        name="virtueExplanation"
        aria-label={`Cómo promueve esta actividad la ${label.toLowerCase()}`}
        placeholder="Cómo la promueve esta actividad (opcional; si lo dejas vacío se usa la explicación del catálogo)"
        defaultValue={virtue?.ownExplanation ?? ""}
        rows={3}
        maxLength={1500}
      />
    </fieldset>
  );
}

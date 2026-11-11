import { Badge } from "@/shared/ui/badge";
import type { VirtueDto } from "../../http/profile-schemas";

const VISIBLE = 3;

export function CardVirtues({ virtues }: { virtues: VirtueDto[] }) {
  if (virtues.length === 0) return null;
  const hidden = virtues.length - VISIBLE;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Virtudes que promueve">
      {virtues.slice(0, VISIBLE).map((virtue) => (
        <li key={virtue.id}>
          <Badge variant="secondary">{virtue.name}</Badge>
        </li>
      ))}
      {hidden > 0 && (
        <li>
          <Badge variant="outline">+{hidden}</Badge>
        </li>
      )}
    </ul>
  );
}

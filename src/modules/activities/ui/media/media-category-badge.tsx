import { Badge } from "@/shared/ui/badge";
import type { MediaDto } from "../../http/activity-schemas";
import { CATEGORY_LABELS } from "../labels";

export function MediaCategoryBadge({ media }: { media: Pick<MediaDto, "category" | "categorySource"> }) {
  const hint = media.categorySource === "manual" ? "Asignado a mano" : "Asignado por la IA";
  return (
    <Badge variant="outline" className="max-w-full truncate" title={hint}>
      {CATEGORY_LABELS[media.category]}
    </Badge>
  );
}

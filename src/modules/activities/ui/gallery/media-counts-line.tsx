import { FileTextIcon, ImageIcon, VideoIcon } from "lucide-react";
import type { ActivityCardDto } from "../../http/public-schemas";

export function MediaCountsLine({ counts }: { counts: ActivityCardDto["counts"] }) {
  const entries = [
    { icon: ImageIcon, total: counts.photo, label: "fotos" },
    { icon: VideoIcon, total: counts.video + counts.youtube, label: "videos" },
    { icon: FileTextIcon, total: counts.document, label: "documentos" },
  ].filter((entry) => entry.total > 0);

  return (
    <ul className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {entries.map(({ icon: Icon, total, label }) => (
        <li key={label} className="flex items-center gap-1" aria-label={`${total} ${label}`}>
          <Icon className="size-3.5" aria-hidden />
          {total}
        </li>
      ))}
    </ul>
  );
}

import {
  FileSpreadsheetIcon,
  FileTextIcon,
  FileTypeIcon,
  ImageIcon,
  PresentationIcon,
  VideoIcon,
  PlayCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { createElement } from "react";
import type { MediaDto } from "../../http/activity-schemas";

const DOCUMENT_ICONS: Record<string, LucideIcon> = {
  pdf: FileTextIcon,
  docx: FileTypeIcon,
  xlsx: FileSpreadsheetIcon,
  pptx: PresentationIcon,
};

export function mediaIcon(media: Pick<MediaDto, "kind" | "originalName">): LucideIcon {
  if (media.kind === "photo") return ImageIcon;
  if (media.kind === "video") return VideoIcon;
  if (media.kind === "youtube") return PlayCircleIcon;
  const extension = media.originalName.split(".").pop()?.toLowerCase() ?? "";
  return DOCUMENT_ICONS[extension] ?? FileTextIcon;
}

export function MediaKindIcon({ media, className }: { media: Pick<MediaDto, "kind" | "originalName">; className?: string }) {
  return createElement(mediaIcon(media), { className, "aria-hidden": true });
}

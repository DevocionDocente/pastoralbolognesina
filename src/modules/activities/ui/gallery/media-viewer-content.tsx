import { DownloadIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { MediaDto } from "../../http/activity-schemas";
import { MediaKindIcon } from "../media/media-kind-icon";

export function MediaViewerContent({ media, startAt }: { media: MediaDto; startAt?: number }) {
  const label = media.title ?? media.originalName;

  if (media.kind === "photo") {
    // eslint-disable-next-line @next/next/no-img-element -- presigned storage URL
    return <img src={media.viewUrl} alt={label} className="max-h-[75vh] w-auto max-w-full rounded-md object-contain" />;
  }
  if (media.kind === "video") {
    return <video src={startAt ? `${media.viewUrl}#t=${startAt}` : media.viewUrl} controls autoPlay preload="metadata" className="max-h-[75vh] w-full rounded-md bg-black" />;
  }
  if (media.kind === "youtube") {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}${startAt ? `?start=${startAt}` : ""}`}
        title={label}
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-md"
      />
    );
  }
  if (media.mimeType === "application/pdf") {
    return <iframe src={media.viewUrl} title={label} className="h-[75vh] w-full rounded-md border bg-white" />;
  }
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <MediaKindIcon media={media} className="size-16 text-muted-foreground" />
      <p className="font-medium">{media.originalName}</p>
      <Button asChild>
        <a href={media.downloadUrl ?? media.viewUrl}>
          <DownloadIcon />
          Descargar
        </a>
      </Button>
    </div>
  );
}

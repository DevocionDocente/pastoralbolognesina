import { DownloadIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function DownloadButton({ url, name, className }: { url: string; name: string; className?: string }) {
  return (
    <a
      href={url}
      download={name}
      aria-label={`Descargar ${name}`}
      title={`Descargar ${name}`}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-primary hover:text-primary-foreground",
        className,
      )}
    >
      <DownloadIcon className="size-4" aria-hidden />
    </a>
  );
}

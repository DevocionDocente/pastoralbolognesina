import { ImageIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ManualMark } from "./manual-mark";

interface ReflectionImageProps {
  url: string | null;
  alt: string;
  manual?: boolean;
  className?: string;
}

export function ReflectionImage({ url, alt, manual = false, className }: ReflectionImageProps) {
  const frame = cn("relative aspect-[3/2] w-full overflow-hidden bg-muted", className);
  if (!url) {
    return (
      <div className={cn(frame, "flex items-center justify-center text-muted-foreground")}>
        <ImageIcon className="size-10" aria-hidden />
      </div>
    );
  }
  return (
    <div className={frame}>
      {/* eslint-disable-next-line @next/next/no-img-element -- presigned storage URLs change on every request */}
      <img src={url} alt={alt} className="absolute inset-0 size-full object-cover" />
      {manual && (
        <span className="absolute bottom-2 left-2 rounded-md bg-background/90 px-2 py-1">
          <ManualMark />
        </span>
      )}
    </div>
  );
}

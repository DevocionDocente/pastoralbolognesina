"use client";

import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import type { MediaDto } from "../../http/activity-schemas";
import { MediaViewerContent } from "./media-viewer-content";

export interface ViewerItem {
  media: MediaDto;
  activity?: { id: string; name: string };
  startAt?: number;
}

interface MediaViewerProps {
  items: ViewerItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

export function MediaViewer({ items, index, onIndexChange }: MediaViewerProps) {
  const current = index === null ? null : items[index];
  const move = (step: number) => index !== null && onIndexChange((index + step + items.length) % items.length);

  return (
    <Dialog open={current !== null} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent
        className="max-h-[95vh] w-[calc(100%-1rem)] max-w-5xl gap-3 sm:max-w-5xl"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") move(1);
          if (event.key === "ArrowLeft") move(-1);
        }}
      >
        {current && (
          <>
            <DialogTitle className="pr-8">{current.media.title ?? current.media.originalName}</DialogTitle>
            <DialogDescription className={current.media.description ? undefined : "sr-only"}>
              {current.media.description ?? current.media.originalName}
            </DialogDescription>
            <div className="flex justify-center">
              <MediaViewerContent key={current.media.id} media={current.media} startAt={current.startAt} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              {current.activity ? (
                <Link href={`/activities/${current.activity.id}`} className="text-sm text-primary hover:underline">
                  Ver la actividad: {current.activity.name}
                </Link>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                {current.media.downloadUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={current.media.downloadUrl}>
                      <DownloadIcon />
                      Descargar
                    </a>
                  </Button>
                )}
                {items.length > 1 && (
                  <>
                    <Button variant="outline" size="icon-sm" onClick={() => move(-1)} aria-label="Anterior">
                      <ChevronLeftIcon />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => move(1)} aria-label="Siguiente">
                      <ChevronRightIcon />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

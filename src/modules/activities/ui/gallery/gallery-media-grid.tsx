"use client";

import { useState } from "react";
import type { GalleryMediaDto } from "../../http/public-schemas";
import { MediaTile } from "./media-tile";
import { MediaViewer } from "./media-viewer";

type GridItem = GalleryMediaDto & { evidence?: string | null; second?: number | null };

export function GalleryMediaGrid({ media }: { media: GridItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const items = media.map((item) => ({ media: item, activity: item.activity, startAt: item.second ?? undefined }));

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((item, position) => (
          <MediaTile
            key={item.id}
            media={item}
            caption={`${item.activity.name} · ${item.activity.year}`}
            evidence={item.evidence}
            onOpen={() => setIndex(position)}
          />
        ))}
      </div>
      <MediaViewer items={items} index={index} onIndexChange={setIndex} />
    </>
  );
}

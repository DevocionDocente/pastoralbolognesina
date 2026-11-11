"use client";

import { useState } from "react";
import { MEDIA_CATEGORIES } from "../../domain/media-category";
import type { MediaDto } from "../../http/activity-schemas";
import { CATEGORY_LABELS } from "../labels";
import { MediaTile } from "./media-tile";
import { MediaViewer } from "./media-viewer";

export function ActivityMediaSections({ media }: { media: MediaDto[] }) {
  const ordered = MEDIA_CATEGORIES.flatMap((category) => media.filter((item) => item.category === category));
  const [index, setIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-10">
      {MEDIA_CATEGORIES.map((category) => {
        const items = ordered.filter((item) => item.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category} className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">
              {CATEGORY_LABELS[category]} <span className="text-base font-normal text-muted-foreground">({items.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <MediaTile key={item.id} media={item} onOpen={() => setIndex(ordered.indexOf(item))} />
              ))}
            </div>
          </section>
        );
      })}
      <MediaViewer items={ordered.map((item) => ({ media: item }))} index={index} onIndexChange={setIndex} />
    </div>
  );
}

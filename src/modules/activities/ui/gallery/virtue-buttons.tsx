"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import type { VirtueDto } from "../../http/profile-schemas";
import { VirtueDialog } from "./virtue-dialog";

interface VirtueButtonsProps<T extends VirtueDto> {
  virtues: T[];
  actions?: (virtue: T) => ReactNode;
}

export function VirtueButtons<T extends VirtueDto>({ virtues, actions }: VirtueButtonsProps<T>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = virtues.find((virtue) => virtue.id === selectedId) ?? null;
  return (
    <>
      <ul className="flex flex-wrap gap-2">
        {virtues.map((virtue) => (
          <li key={virtue.id}>
            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setSelectedId(virtue.id)}>
              {virtue.name}
            </Button>
          </li>
        ))}
      </ul>
      <VirtueDialog virtue={selected} onClose={() => setSelectedId(null)}>
        {selected && actions?.(selected)}
      </VirtueDialog>
    </>
  );
}

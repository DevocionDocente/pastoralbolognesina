"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import type { SeriesDto } from "../../http/activity-schemas";
import { ActivityFormDialog } from "./activity-form-dialog";

export function CreateActivityButton({ series }: { series: SeriesDto[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon />
        Nueva actividad
      </Button>
      <ActivityFormDialog open={open} onOpenChange={setOpen} series={series} />
    </>
  );
}

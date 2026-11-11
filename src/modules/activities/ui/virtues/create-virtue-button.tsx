"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { VirtueFormDialog } from "./virtue-form-dialog";

export function CreateVirtueButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon />
        Nueva virtud
      </Button>
      <VirtueFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

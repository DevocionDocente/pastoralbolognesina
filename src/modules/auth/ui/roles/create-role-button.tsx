"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { RoleFormDialog } from "./role-form-dialog";

export function CreateRoleButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon />
        Nuevo rol
      </Button>
      <RoleFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

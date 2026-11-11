"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import type { VirtueDto } from "../../http/profile-schemas";
import { ReflectionImage } from "../profile/reflection-image";
import { galleryHref } from "./gallery-url";

interface VirtueDialogProps {
  virtue: VirtueDto | null;
  onClose: () => void;
  children?: ReactNode;
}

export function VirtueDialog({ virtue, onClose, children }: VirtueDialogProps) {
  return (
    <Dialog open={virtue !== null} onOpenChange={(open) => !open && onClose()}>
      {virtue && (
        <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
          <ReflectionImage url={virtue.imageUrl} alt={`Imagen de reflexión sobre ${virtue.name}`} />
          <div className="flex flex-col gap-4 p-6 pt-2">
            <DialogHeader>
              <DialogTitle className="text-2xl">{virtue.name}</DialogTitle>
              <DialogDescription className="text-base leading-relaxed text-foreground">{virtue.explanation}</DialogDescription>
            </DialogHeader>
            <Button asChild variant="outline" className="self-start">
              <Link href={galleryHref({}, { virtue: virtue.id })}>Ver actividades que promueven {virtue.name}</Link>
            </Button>
            {children}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

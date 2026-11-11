import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { galleryHref, type GalleryParams } from "./gallery-url";

interface GalleryPaginationProps {
  params: GalleryParams;
  page: number;
  pageCount: number;
}

export function GalleryPagination({ params, page, pageCount }: GalleryPaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Páginas" className="flex items-center justify-center gap-3">
      <Button asChild variant="outline" size="sm" className={page <= 1 ? "pointer-events-none opacity-50" : undefined}>
        <Link href={galleryHref(params, { page: page - 1 })} aria-disabled={page <= 1}>
          <ChevronLeftIcon />
          Anterior
        </Link>
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {page} de {pageCount}
      </span>
      <Button asChild variant="outline" size="sm" className={page >= pageCount ? "pointer-events-none opacity-50" : undefined}>
        <Link href={galleryHref(params, { page: page + 1 })} aria-disabled={page >= pageCount}>
          Siguiente
          <ChevronRightIcon />
        </Link>
      </Button>
    </nav>
  );
}

import Image from "next/image";
import { GallerySearchForm } from "./gallery-search-form";
import type { GalleryParams } from "./gallery-url";

export function GalleryHero({ params }: { params: GalleryParams }) {
  return (
    <section className="border-b bg-secondary/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:py-14">
        <Image
          src="/brand/logo.webp"
          alt="Insignia de la I.E. 6064 Francisco Bolognesi"
          width={320}
          height={442}
          className="h-24 w-auto sm:h-28"
          priority
        />
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">Buena práctica pedagógica</p>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Gestión y Búsqueda Inteligente de Actividades Pastorales
        </h1>
        <p className="max-w-2xl text-lg text-balance text-muted-foreground">
          Fortaleciendo la buena convivencia escolar mediante virtudes cristianas
        </p>
        <GallerySearchForm params={params} />
      </div>
    </section>
  );
}

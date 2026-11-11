"use client";

import { useRouter } from "next/navigation";
import type { GalleryFacetsDto } from "../../http/public-schemas";
import { CATEGORY_OPTIONS } from "../labels";
import { FilterSelect } from "./filter-select";
import { galleryHref, type GalleryParams } from "./gallery-url";

export function GalleryFilters({ params, facets }: { params: GalleryParams; facets: GalleryFacetsDto }) {
  const router = useRouter();
  const years = facets.years.map((year) => ({ value: String(year), label: String(year) }));
  const update = (changes: Partial<GalleryParams>) => router.push(galleryHref(params, { ...changes, page: 1 }), { scroll: false });
  const toYear = (value?: string) => (value ? Number(value) : undefined);
  const options = (items: { id: string; name: string }[]) => items.map((item) => ({ value: item.id, label: item.name }));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap">
      <FilterSelect
        id="category"
        label="Tipo de archivo"
        allLabel="Todos"
        value={params.category}
        options={CATEGORY_OPTIONS}
        onChange={(category) => update({ category, kind: undefined })}
      />
      <FilterSelect id="virtue" label="Virtud" allLabel="Todas" value={params.virtue} options={options(facets.virtues)} onChange={(virtue) => update({ virtue })} />
      <FilterSelect
        id="series"
        label="Actividad recurrente"
        allLabel="Todas"
        value={params.series}
        options={options(facets.series)}
        onChange={(series) => update({ series })}
      />
      <FilterSelect id="from" label="Desde" allLabel="Cualquier año" value={params.from?.toString()} options={years} onChange={(from) => update({ from: toYear(from) })} />
      <FilterSelect id="to" label="Hasta" allLabel="Cualquier año" value={params.to?.toString()} options={years} onChange={(to) => update({ to: toYear(to) })} />
    </div>
  );
}

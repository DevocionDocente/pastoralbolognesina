import Form from "next/form";
import { SearchIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { GalleryParams } from "./gallery-url";

export function GallerySearchForm({ params }: { params: GalleryParams }) {
  const kept = {
    from: params.from,
    to: params.to,
    series: params.series,
    kind: params.kind,
    category: params.category,
    virtue: params.virtue,
    view: params.view,
  };

  return (
    <Form role="search" action="/" scroll={false} className="flex w-full max-w-2xl gap-2">
      {Object.entries(kept).map(([name, value]) =>
        value === undefined ? null : <input key={name} type="hidden" name={name} value={value} />,
      )}
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={params.q}
          placeholder="Busca lo que quieras: procesión, misa, óbolo, niños rezando…"
          aria-label="Buscar"
          className="h-12 bg-card pl-10 text-base"
        />
      </div>
      <Button type="submit" size="lg" className="h-12">
        Buscar
      </Button>
    </Form>
  );
}

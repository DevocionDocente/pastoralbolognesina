export type GalleryView = "activities" | "media";

export interface GalleryParams {
  q?: string;
  from?: number;
  to?: number;
  series?: string;
  kind?: string;
  category?: string;
  virtue?: string;
  view?: GalleryView;
  page?: number;
}

export function galleryHref(params: GalleryParams, overrides: Partial<GalleryParams> = {}): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === "" || (key === "page" && value === 1) || (key === "view" && value === "activities")) continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `/?${query}` : "/";
}

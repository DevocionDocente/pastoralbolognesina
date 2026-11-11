import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { manualSource } from "@/modules/manual/source";
import { MANUAL_TRANSLATIONS } from "@/modules/manual/translations";
import { BrandMark } from "@/shared/ui/brand-mark";

export default function ManualLayout({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      search={{ options: { api: "/manual/search" } }}
      theme={{ defaultTheme: "light" }}
      i18n={{ locale: "es", translations: MANUAL_TRANSLATIONS }}
    >
      <DocsLayout
        tree={manualSource.getPageTree()}
        nav={{ title: <BrandMark />, url: "/manual" }}
        links={[{ text: "Ir al panel", url: "/dashboard" }]}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}

import type { ReactNode } from "react";
import { PublicFooter } from "@/modules/activities/ui/gallery/public-footer";
import { PublicHeader } from "@/modules/activities/ui/gallery/public-header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}

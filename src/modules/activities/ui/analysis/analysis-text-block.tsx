import type { ReactNode } from "react";

export function AnalysisTextBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="rounded-lg border p-3 text-sm">
      <summary className="cursor-pointer font-medium">{title}</summary>
      <div className="mt-2 whitespace-pre-line text-muted-foreground">{children}</div>
    </details>
  );
}

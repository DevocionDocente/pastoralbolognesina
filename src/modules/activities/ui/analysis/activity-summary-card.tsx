import { SparklesIcon } from "lucide-react";

export function ActivitySummaryCard({ summary, title = "Resumen generado con IA" }: { summary: string | null; title?: string }) {
  if (!summary) return null;
  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-accent/30 p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <SparklesIcon className="size-4 text-primary" aria-hidden />
        {title}
      </h2>
      <p className="text-sm leading-relaxed">{summary}</p>
    </section>
  );
}

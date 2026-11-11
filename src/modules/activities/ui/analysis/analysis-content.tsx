import { Badge } from "@/shared/ui/badge";
import type { AnalysisDto } from "../../http/activity-schemas";
import { AnalysisTextBlock } from "./analysis-text-block";

function clock(second: number) {
  return `${Math.floor(second / 60)}:${String(second % 60).padStart(2, "0")}`;
}

export function AnalysisContent({ analysis }: { analysis: AnalysisDto }) {
  if (!analysis.description) {
    return <p className="text-sm text-muted-foreground">Todavía no hay resultados del análisis.</p>;
  }

  return (
    <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
      <p>{analysis.description}</p>
      {analysis.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {analysis.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {analysis.moments.length > 0 && (
        <AnalysisTextBlock title="Lo que se ve en el video">
          <ul className="flex flex-col gap-1">
            {analysis.moments.map((moment) => (
              <li key={moment.second}>
                <span className="font-mono text-xs text-muted-foreground">{clock(moment.second)}</span> {moment.text}
              </li>
            ))}
          </ul>
        </AnalysisTextBlock>
      )}
      {analysis.transcript && <AnalysisTextBlock title="Lo que se escucha">{analysis.transcript}</AnalysisTextBlock>}
      {analysis.extractedText && <AnalysisTextBlock title="Texto del documento">{analysis.extractedText}</AnalysisTextBlock>}
    </div>
  );
}

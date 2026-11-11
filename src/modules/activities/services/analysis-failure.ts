import { AnalysisUnavailableError } from "../domain/analysis";

export interface Failure {
  message: string;
  retryable: boolean;
}

export function describeFailure(error: unknown): Failure {
  if (error instanceof AnalysisUnavailableError) {
    return { message: "Este archivo no se puede analizar con inteligencia artificial.", retryable: false };
  }
  const code = (error as { code?: string }).code;
  if (code === "insufficient_quota") {
    return { message: "La cuenta de OpenAI no tiene saldo. Recarga créditos y reintenta el análisis.", retryable: false };
  }
  if (code === "invalid_api_key") {
    return { message: "La clave de OpenAI no es válida. Revisa la configuración.", retryable: false };
  }
  return { message: "No se pudo analizar el archivo. Se reintentará automáticamente.", retryable: true };
}

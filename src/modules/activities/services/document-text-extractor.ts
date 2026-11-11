export interface DocumentTextExtractor {
  extract(file: Buffer, mimeType: string): Promise<string>;
}

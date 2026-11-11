import { OfficeParser } from "officeparser";
import { extractText, getDocumentProxy } from "unpdf";
import type { DocumentTextExtractor } from "@/modules/activities/services/document-text-extractor";

export class OfficeDocumentTextExtractor implements DocumentTextExtractor {
  async extract(file: Buffer, mimeType: string): Promise<string> {
    if (mimeType === "application/pdf") return this.fromPdf(file);
    const document = await OfficeParser.parseOffice(file);
    const { value } = await document.to("text");
    return value;
  }

  private async fromPdf(file: Buffer): Promise<string> {
    const pdf = await getDocumentProxy(new Uint8Array(file));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }
}

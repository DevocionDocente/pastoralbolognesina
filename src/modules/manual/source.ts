import { loader } from "fumadocs-core/source";
import { defineDocs } from "fumadocs-mdx/macro";

const manual = defineDocs({ dir: "content/manual" });

export const manualSource = loader({
  baseUrl: "/manual",
  source: manual.toFumadocsSource(),
});

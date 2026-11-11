import { createFromSource } from "fumadocs-core/search/server";
import { manualSource } from "@/modules/manual/source";

export const { GET } = createFromSource(manualSource, { language: "spanish" });

const LOWERCASE_WORDS = new Set(["de", "del", "la", "las", "el", "los", "y", "a", "al", "en", "por", "para"]);
const ACRONYMS = new Set(["DOMUND"]);
const ACCENTS: Record<string, string> = { oracion: "oración", celebracion: "celebración", comunion: "comunión", confirmacion: "confirmación" };

export interface ActivityNaming {
  name: string;
  seriesName: string;
  year: number;
}

function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => ACCENTS[word] ?? word)
    .map((word, index) => {
      if (ACRONYMS.has(word.toUpperCase())) return word.toUpperCase();
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word;
      return word.charAt(0).toLocaleUpperCase("es") + word.slice(1);
    })
    .join(" ");
}

function needsCasing(text: string): boolean {
  return text === text.toUpperCase() || text === text.toLowerCase();
}

export function nameFromFolder(folder: string): ActivityNaming | null {
  const match = folder.match(/(19|20)\d{2}/);
  if (!match) return null;
  const year = Number(match[0]);
  const base = folder.replace(match[0], " ").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  const seriesName = needsCasing(base) ? titleCase(base) : base;
  return { name: `${seriesName} ${year}`, seriesName, year };
}

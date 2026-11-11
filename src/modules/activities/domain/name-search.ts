export interface NameSearch {
  words: string[];
  years: number[];
}

export function parseNameSearch(query: string): NameSearch {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  return {
    words: tokens.filter((token) => !/^\d+$/.test(token)),
    years: tokens.filter((token) => /^\d{4}$/.test(token)).map(Number),
  };
}

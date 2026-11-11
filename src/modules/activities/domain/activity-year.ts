import { ValidationError } from "@/shared/domain/domain-error";

export const FIRST_ACTIVITY_YEAR = 2023;

export function selectableYears(today = new Date()): number[] {
  const latest = today.getFullYear();
  return Array.from({ length: latest - FIRST_ACTIVITY_YEAR + 1 }, (_, index) => latest - index);
}

export function resolveActivityYear(date: string | null, year: number | null): number {
  const resolved = date ? Number(date.slice(0, 4)) : year;
  if (!resolved) throw new ValidationError("A date or a year is required");
  if (!selectableYears().includes(resolved)) throw new ValidationError("Year is out of range");
  return resolved;
}

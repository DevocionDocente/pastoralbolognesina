import { notFound } from "next/navigation";
import { isDomainError } from "@/shared/domain/domain-error";

export async function orNotFound<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (isDomainError(error) && error.status === 404) notFound();
    throw error;
  }
}

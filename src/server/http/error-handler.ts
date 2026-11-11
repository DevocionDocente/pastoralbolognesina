import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { isDomainError } from "@/shared/domain/domain-error";

export const errorHandler: ErrorHandler = (error, c) => {
  if (isDomainError(error)) {
    return c.json({ code: error.code, message: error.message }, error.status);
  }
  if (error instanceof HTTPException && error.status < 500) {
    return c.json({ code: "BAD_REQUEST", message: error.message }, error.status);
  }
  console.error(error);
  return c.json({ code: "INTERNAL_ERROR", message: "Unexpected error" }, 500);
};

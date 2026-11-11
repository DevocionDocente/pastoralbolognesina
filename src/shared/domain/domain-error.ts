export abstract class DomainError extends Error {
  abstract readonly status: 400 | 401 | 403 | 404 | 409;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  readonly status = 400;
  readonly code = "VALIDATION_ERROR";
}

export class UnauthorizedError extends DomainError {
  readonly status = 401;
  readonly code = "UNAUTHORIZED";

  constructor(message = "Authentication required") {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  readonly status = 403;
  readonly code = "FORBIDDEN";

  constructor(message = "Missing permission") {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  readonly status = 404;
  readonly code = "NOT_FOUND";
}

export class ConflictError extends DomainError {
  readonly status = 409;
  readonly code = "CONFLICT";
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof Error && typeof (error as DomainError).status === "number" && typeof (error as DomainError).code === "string";
}

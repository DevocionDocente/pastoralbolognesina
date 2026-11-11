import { createMiddleware } from "hono/factory";
import type { Auth } from "@/server/auth/create-auth";
import { UnauthorizedError } from "@/shared/domain/domain-error";
import type { AppEnv } from "../app-env";

export class SessionMiddleware {
  constructor(private readonly auth: Auth) {}

  readonly requireSession = createMiddleware<AppEnv>(async (c, next) => {
    const session = await this.auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) throw new UnauthorizedError();
    c.set("userId", session.user.id);
    await next();
  });
}

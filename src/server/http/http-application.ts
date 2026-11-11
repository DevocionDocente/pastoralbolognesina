import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import type { Auth } from "../auth/create-auth";
import type { AppEnv, Controller } from "./app-env";
import { errorHandler } from "./error-handler";

export class HttpApplication {
  constructor(
    private readonly auth: Auth,
    private readonly controllers: Controller[],
  ) {}

  build(): OpenAPIHono<AppEnv> {
    const app = new OpenAPIHono<AppEnv>({ defaultHook: this.validationHook }).basePath("/api");
    app.onError(errorHandler);
    app.on(["GET", "POST"], "/auth/*", (c) => this.auth.handler(c.req.raw));
    this.controllers.forEach((controller) => controller.register(app));
    this.registerDocs(app);
    return app;
  }

  private registerDocs(app: OpenAPIHono<AppEnv>): void {
    app.openAPIRegistry.registerComponent("securitySchemes", "session", {
      type: "apiKey",
      in: "cookie",
      name: "better-auth.session_token",
    });
    app.doc31("/openapi.json", {
      openapi: "3.1.0",
      info: { title: "Pastoral Bolognesina API", version: "1.0.0" },
    });
    app.get(
      "/docs",
      Scalar({
        pageTitle: "Pastoral Bolognesina API",
        sources: [
          { title: "Pastoral Bolognesina", url: "/api/openapi.json" },
          { title: "Authentication", url: "/api/auth/open-api/generate-schema" },
        ],
      }),
    );
  }

  private readonly validationHook = (
    result: { success: boolean; error?: { issues: { message: string }[] } },
    c: { json: (body: unknown, status: 400) => Response },
  ) => {
    if (result.success) return;
    const message = result.error?.issues.map((issue) => issue.message).join(", ") ?? "Invalid request";
    return c.json({ code: "VALIDATION_ERROR", message }, 400);
  };
}

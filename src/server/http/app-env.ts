import type { OpenAPIHono } from "@hono/zod-openapi";

export interface AppEnv {
  Variables: { userId: string };
}

export type App = OpenAPIHono<AppEnv>;

export interface Controller {
  register(app: App): void;
}

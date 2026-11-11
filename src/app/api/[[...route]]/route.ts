import { container } from "@/server/container";

let app: ReturnType<typeof buildApp> | undefined;

function buildApp() {
  return container().http.build();
}

function handler(request: Request) {
  app ??= buildApp();
  return app.fetch(request);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

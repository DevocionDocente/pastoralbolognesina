import type { App, Controller } from "../app-env";
import { getHealthRoute } from "./health-routes";

export class HealthController implements Controller {
  register(app: App): void {
    app.openapi(getHealthRoute, (c) =>
      c.json({ status: "ok" as const, timestamp: new Date().toISOString() }, 200),
    );
  }
}

import type { App, Controller } from "@/server/http/app-env";
import type { SessionMiddleware } from "@/server/http/middlewares/session-middleware";
import type { ProfileService } from "../services/profile-service";
import { getProfileRoute } from "./profile-routes";

export class ProfileController implements Controller {
  constructor(
    private readonly profiles: ProfileService,
    private readonly session: SessionMiddleware,
  ) {}

  register(app: App): void {
    app.use(getProfileRoute.path, this.session.requireSession);
    app.openapi(getProfileRoute, async (c) => c.json(await this.profiles.getProfile(c.get("userId")), 200));
  }
}

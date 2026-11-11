import type { App, Controller } from "@/server/http/app-env";
import type { ProfileEditorService } from "../services/profile-editor-service";
import type { ProfilePresenter } from "./profile-presenter";
import {
  getProfileRoute,
  regenerateProfileRoute,
  regenerateVirtueImageForActivityRoute,
  replaceProfileImageRoute,
  replaceVirtueImageForActivityRoute,
  resetVirtueImageForActivityRoute,
  setProfileVirtuesRoute,
  updateProfileTextsRoute,
} from "./profile-routes";

export class ActivityProfileController implements Controller {
  constructor(
    private readonly profiles: ProfileEditorService,
    private readonly presenter: ProfilePresenter,
  ) {}

  register(app: App): void {
    app.openapi(getProfileRoute, async (c) => {
      const profile = await this.profiles.get(c.get("userId"), c.req.valid("param").id);
      return c.json(await this.presenter.profile(profile), 200);
    });

    app.openapi(updateProfileTextsRoute, async (c) => {
      const profile = await this.profiles.updateTexts(c.get("userId"), c.req.valid("param").id, c.req.valid("json"));
      return c.json(await this.presenter.profile(profile), 200);
    });

    app.openapi(setProfileVirtuesRoute, async (c) => {
      const profile = await this.profiles.setVirtues(c.get("userId"), c.req.valid("param").id, c.req.valid("json").virtues);
      return c.json(await this.presenter.profile(profile), 200);
    });

    app.openapi(replaceProfileImageRoute, async (c) => {
      const image = Buffer.from(await c.req.valid("form").file.arrayBuffer());
      const profile = await this.profiles.replaceImage(c.get("userId"), c.req.valid("param").id, image);
      return c.json(await this.presenter.profile(profile), 200);
    });

    app.openapi(regenerateProfileRoute, async (c) => {
      const profile = await this.profiles.regenerate(c.get("userId"), c.req.valid("param").id, c.req.valid("json").fields);
      return c.json(await this.presenter.profile(profile), 202);
    });

    app.openapi(replaceVirtueImageForActivityRoute, async (c) => {
      const { id, virtueId } = c.req.valid("param");
      const image = Buffer.from(await c.req.valid("form").file.arrayBuffer());
      const profile = await this.profiles.replaceVirtueImage(c.get("userId"), id, virtueId, image);
      return c.json(await this.presenter.profile(profile), 200);
    });

    app.openapi(regenerateVirtueImageForActivityRoute, async (c) => {
      const { id, virtueId } = c.req.valid("param");
      await this.profiles.regenerateVirtueImage(c.get("userId"), id, virtueId);
      return c.body(null, 202);
    });

    app.openapi(resetVirtueImageForActivityRoute, async (c) => {
      const { id, virtueId } = c.req.valid("param");
      const profile = await this.profiles.resetVirtueImage(c.get("userId"), id, virtueId);
      return c.json(await this.presenter.profile(profile), 200);
    });
  }
}

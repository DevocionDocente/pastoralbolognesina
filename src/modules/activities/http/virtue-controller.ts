import type { App, Controller } from "@/server/http/app-env";
import type { SessionMiddleware } from "@/server/http/middlewares/session-middleware";
import type { VirtueCatalogService } from "../services/virtue-catalog-service";
import type { ProfilePresenter } from "./profile-presenter";
import {
  createVirtueRoute,
  deleteVirtueRoute,
  listVirtuesRoute,
  regenerateVirtueImageRoute,
  replaceVirtueImageRoute,
  updateVirtueRoute,
} from "./virtue-routes";

export class VirtueController implements Controller {
  constructor(
    private readonly virtues: VirtueCatalogService,
    private readonly presenter: ProfilePresenter,
    private readonly session: SessionMiddleware,
  ) {}

  register(app: App): void {
    for (const path of ["/virtues", "/virtues/*"]) app.use(path, this.session.requireSession);

    app.openapi(listVirtuesRoute, async (c) => {
      const virtues = await this.virtues.list(c.get("userId"));
      return c.json(await Promise.all(virtues.map((virtue) => this.presenter.virtueUsage(virtue))), 200);
    });

    app.openapi(createVirtueRoute, async (c) => {
      const virtue = await this.virtues.create(c.get("userId"), c.req.valid("json"));
      return c.json(await this.presenter.virtue(virtue), 201);
    });

    app.openapi(updateVirtueRoute, async (c) => {
      const virtue = await this.virtues.update(c.get("userId"), c.req.valid("param").id, c.req.valid("json"));
      return c.json(await this.presenter.virtue(virtue), 200);
    });

    app.openapi(deleteVirtueRoute, async (c) => {
      await this.virtues.delete(c.get("userId"), c.req.valid("param").id);
      return c.body(null, 204);
    });

    app.openapi(replaceVirtueImageRoute, async (c) => {
      const image = Buffer.from(await c.req.valid("form").file.arrayBuffer());
      const virtue = await this.virtues.replaceImage(c.get("userId"), c.req.valid("param").id, image);
      return c.json(await this.presenter.virtue(virtue), 200);
    });

    app.openapi(regenerateVirtueImageRoute, async (c) => {
      await this.virtues.regenerateImage(c.get("userId"), c.req.valid("param").id);
      return c.body(null, 202);
    });
  }
}

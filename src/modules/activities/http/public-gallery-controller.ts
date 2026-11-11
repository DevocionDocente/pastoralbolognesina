import type { App, Controller } from "@/server/http/app-env";
import type { PublicGalleryService } from "../services/public-gallery-service";
import type { PublicGalleryPresenter } from "./public-gallery-presenter";
import type { SearchPresenter } from "./search-presenter";
import {
  publicActivitiesRoute,
  publicActivityRoute,
  publicFacetsRoute,
  publicMediaRoute,
  publicSeriesRoute,
  searchRoute,
} from "./public-routes";

export class PublicGalleryController implements Controller {
  constructor(
    private readonly presenter: PublicGalleryPresenter,
    private readonly gallery: PublicGalleryService,
    private readonly search: SearchPresenter,
  ) {}

  register(app: App): void {
    app.openapi(publicActivitiesRoute, async (c) => c.json(await this.presenter.activities(c.req.valid("query")), 200));
    app.openapi(publicMediaRoute, async (c) => c.json(await this.presenter.media(c.req.valid("query")), 200));
    app.openapi(publicActivityRoute, async (c) => c.json(await this.presenter.activity(c.req.valid("param").id), 200));
    app.openapi(publicSeriesRoute, async (c) => c.json(await this.presenter.series(c.req.valid("param").id), 200));
    app.openapi(publicFacetsRoute, async (c) => c.json(await this.gallery.facets(), 200));
    app.openapi(searchRoute, async (c) => c.json(await this.search.run(c.req.valid("query")), 200));
  }
}

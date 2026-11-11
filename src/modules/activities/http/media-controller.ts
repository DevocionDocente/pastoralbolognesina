import type { App, Controller } from "@/server/http/app-env";
import type { SessionMiddleware } from "@/server/http/middlewares/session-middleware";
import type { MediaItem } from "../domain/activity";
import type { AnalysisStatusService } from "../services/analysis-status-service";
import type { MediaService } from "../services/media-service";
import type { MediaUrlResolver } from "../services/media-url-resolver";
import type { UploadService } from "../services/upload-service";
import { toAnalysisDto, toMediaDto } from "./activity-mappers";
import {
  abortUploadRoute,
  addYoutubeRoute,
  completeUploadRoute,
  deleteMediaRoute,
  getAnalysisRoute,
  listMediaRoute,
  retryAnalysisRoute,
  setMediaCategoryRoute,
  startUploadRoute,
  updateMediaRoute,
} from "./media-routes";

export class MediaController implements Controller {
  constructor(
    private readonly media: MediaService,
    private readonly uploads: UploadService,
    private readonly analysis: AnalysisStatusService,
    private readonly urls: MediaUrlResolver,
    private readonly session: SessionMiddleware,
  ) {}

  register(app: App): void {
    app.use("/media/*", this.session.requireSession);

    app.openapi(listMediaRoute, async (c) => {
      const items = await this.media.list(c.get("userId"), c.req.valid("param").id);
      return c.json(await Promise.all(items.map((item) => this.toDto(item))), 200);
    });

    app.openapi(startUploadRoute, async (c) =>
      c.json(await this.uploads.start(c.get("userId"), c.req.valid("param").id, c.req.valid("json")), 201),
    );

    app.openapi(completeUploadRoute, async (c) => {
      const item = await this.uploads.complete(c.get("userId"), c.req.valid("param").id, c.req.valid("json"));
      return c.json(await this.toDto(item), 201);
    });

    app.openapi(abortUploadRoute, async (c) => {
      await this.uploads.abort(c.get("userId"), c.req.valid("param").id, c.req.valid("json"));
      return c.body(null, 204);
    });

    app.openapi(addYoutubeRoute, async (c) => {
      const item = await this.media.addYoutube(c.get("userId"), c.req.valid("param").id, c.req.valid("json").url);
      return c.json(await this.toDto(item), 201);
    });

    app.openapi(updateMediaRoute, async (c) => {
      const item = await this.media.updateDetails(c.get("userId"), c.req.valid("param").id, c.req.valid("json"));
      return c.json(await this.toDto(item), 200);
    });

    app.openapi(getAnalysisRoute, async (c) =>
      c.json(toAnalysisDto(await this.analysis.details(c.get("userId"), c.req.valid("param").id)), 200),
    );

    app.openapi(retryAnalysisRoute, async (c) => {
      const item = await this.analysis.retry(c.get("userId"), c.req.valid("param").id);
      return c.json(await this.toDto(item), 202);
    });

    app.openapi(setMediaCategoryRoute, async (c) => {
      const item = await this.media.setCategory(c.get("userId"), c.req.valid("param").id, c.req.valid("json").category);
      return c.json(await this.toDto(item), 200);
    });

    app.openapi(deleteMediaRoute, async (c) => {
      await this.media.delete(c.get("userId"), c.req.valid("param").id);
      return c.body(null, 204);
    });
  }

  private async toDto(item: MediaItem) {
    return toMediaDto(item, await this.urls.resolve(item));
  }
}

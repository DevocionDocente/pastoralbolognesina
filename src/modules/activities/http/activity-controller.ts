import type { App, Controller } from "@/server/http/app-env";
import type { SessionMiddleware } from "@/server/http/middlewares/session-middleware";
import type { ActivityService } from "../services/activity-service";
import { toActivityDto } from "./activity-mappers";
import {
  createActivityRoute,
  deleteActivityRoute,
  getActivityRoute,
  listActivitiesRoute,
  listSeriesRoute,
  publishActivityRoute,
  updateActivityRoute,
} from "./activity-routes";

export class ActivityController implements Controller {
  constructor(
    private readonly activities: ActivityService,
    private readonly session: SessionMiddleware,
  ) {}

  register(app: App): void {
    for (const path of ["/activities", "/activities/*", "/activity-series"]) app.use(path, this.session.requireSession);

    app.openapi(listActivitiesRoute, async (c) => {
      const activities = await this.activities.list(c.get("userId"), c.req.valid("query").q);
      return c.json(activities.map(toActivityDto), 200);
    });

    app.openapi(getActivityRoute, async (c) => {
      const { activity, ...capabilities } = await this.activities.get(c.get("userId"), c.req.valid("param").id);
      return c.json({ ...toActivityDto(activity), ...capabilities }, 200);
    });

    app.openapi(createActivityRoute, async (c) =>
      c.json(toActivityDto(await this.activities.create(c.get("userId"), c.req.valid("json"))), 201),
    );

    app.openapi(updateActivityRoute, async (c) => {
      const activity = await this.activities.update(c.get("userId"), c.req.valid("param").id, c.req.valid("json"));
      return c.json(toActivityDto(activity), 200);
    });

    app.openapi(publishActivityRoute, async (c) => {
      const { published } = c.req.valid("json");
      const activity = await this.activities.setPublished(c.get("userId"), c.req.valid("param").id, published);
      return c.json(toActivityDto(activity), 200);
    });

    app.openapi(deleteActivityRoute, async (c) => {
      await this.activities.delete(c.get("userId"), c.req.valid("param").id);
      return c.body(null, 204);
    });

    app.openapi(listSeriesRoute, async (c) => c.json(await this.activities.listSeries(c.get("userId")), 200));
  }
}

import type { App, Controller } from "@/server/http/app-env";
import type { SessionMiddleware } from "@/server/http/middlewares/session-middleware";
import { PERMISSION_LABELS } from "../domain/permission-labels";
import { PERMISSIONS } from "../domain/permissions";
import type { RoleService } from "../services/role-service";
import {
  createRoleRoute,
  deleteRoleRoute,
  listPermissionsRoute,
  listRolesRoute,
  updateRoleRoute,
} from "./role-routes";

export class RoleController implements Controller {
  constructor(
    private readonly roles: RoleService,
    private readonly session: SessionMiddleware,
  ) {}

  register(app: App): void {
    for (const path of ["/roles", "/roles/*", "/permissions"]) app.use(path, this.session.requireSession);

    app.openapi(listPermissionsRoute, (c) =>
      c.json(PERMISSIONS.map((key) => ({ key, label: PERMISSION_LABELS[key] })), 200),
    );

    app.openapi(listRolesRoute, async (c) => c.json(await this.roles.list(c.get("userId")), 200));

    app.openapi(createRoleRoute, async (c) =>
      c.json(await this.roles.create(c.get("userId"), c.req.valid("json")), 201),
    );

    app.openapi(updateRoleRoute, async (c) =>
      c.json(await this.roles.update(c.get("userId"), c.req.valid("param").id, c.req.valid("json")), 200),
    );

    app.openapi(deleteRoleRoute, async (c) => {
      await this.roles.delete(c.get("userId"), c.req.valid("param").id);
      return c.body(null, 204);
    });
  }
}

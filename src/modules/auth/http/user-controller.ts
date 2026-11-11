import type { App, Controller } from "@/server/http/app-env";
import type { SessionMiddleware } from "@/server/http/middlewares/session-middleware";
import type { AccessService } from "../services/access-service";
import type { UserDirectoryService } from "../services/user-directory-service";
import type { UserPermissionService } from "../services/user-permission-service";
import { toAccessRecordDto, toUserDto } from "./user-mappers";
import {
  accessHistoryRoute,
  createUserRoute,
  getUserPermissionsRoute,
  grantAccessRoute,
  listUsersRoute,
  rejectUserRoute,
  resetPasswordRoute,
  revokeAccessRoute,
  setUserPermissionsRoute,
  updateUserRoute,
} from "./user-routes";

export class UserController implements Controller {
  constructor(
    private readonly directory: UserDirectoryService,
    private readonly access: AccessService,
    private readonly permissions: UserPermissionService,
    private readonly session: SessionMiddleware,
  ) {}

  register(app: App): void {
    app.use("/users", this.session.requireSession);
    app.use("/users/*", this.session.requireSession);

    app.openapi(listUsersRoute, async (c) => {
      const users = await this.directory.list(c.get("userId"), c.req.valid("query").status);
      return c.json(users.map(toUserDto), 200);
    });

    app.openapi(createUserRoute, async (c) => {
      const user = await this.directory.create(c.get("userId"), c.req.valid("json"));
      return c.json(toUserDto(user), 201);
    });

    app.openapi(updateUserRoute, async (c) => {
      const user = await this.directory.updateDetails(c.get("userId"), c.req.valid("param").id, c.req.valid("json"));
      return c.json(toUserDto(user), 200);
    });

    app.openapi(grantAccessRoute, async (c) => {
      const user = await this.access.grant(c.get("userId"), c.req.valid("param").id, c.req.valid("json").roleId);
      return c.json(toUserDto(user), 200);
    });

    app.openapi(revokeAccessRoute, async (c) => {
      const user = await this.access.revoke(c.get("userId"), c.req.valid("param").id, c.req.valid("json"));
      return c.json(toUserDto(user), 200);
    });

    app.openapi(rejectUserRoute, async (c) => {
      await this.access.reject(c.get("userId"), c.req.valid("param").id);
      return c.body(null, 204);
    });

    app.openapi(resetPasswordRoute, async (c) => {
      await this.directory.resetPassword(c.get("userId"), c.req.valid("param").id, c.req.valid("json").password);
      return c.body(null, 204);
    });

    app.openapi(accessHistoryRoute, async (c) => {
      const records = await this.directory.accessHistory(c.get("userId"), c.req.valid("param").id);
      return c.json(records.map(toAccessRecordDto), 200);
    });

    app.openapi(getUserPermissionsRoute, async (c) =>
      c.json(await this.permissions.get(c.get("userId"), c.req.valid("param").id), 200),
    );

    app.openapi(setUserPermissionsRoute, async (c) => {
      const { id } = c.req.valid("param");
      return c.json(await this.permissions.set(c.get("userId"), id, c.req.valid("json").permissions), 200);
    });
  }
}

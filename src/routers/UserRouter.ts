import { Router } from "express";
import { UserController } from "../controller/controllers/UserController";
import { MiddlewareFactory } from "../middlewares/MiddlewareFactory";
import { IRouter } from "./IRouter";

export class UserRouter implements IRouter {
  routeName = "User";
  basePath = "/api/users";
  authenticate = true;

  constructor(
    private readonly router: Router,
    private readonly controller: UserController
  ) {}

  getRouter(): Router {
    this.router.use(MiddlewareFactory.authenticateToken);

    this.router.get(
      "/:id/leave-balance",
      MiddlewareFactory.authoriseRoles([1, 2, 3]),
      this.controller.getLeaveBalance.bind(this.controller)
    );

    this.router.get(
      "/",
      MiddlewareFactory.authoriseRoles([1]),
      this.controller.getAllUsers.bind(this.controller)
    );

    this.router.post(
      "/",
      MiddlewareFactory.authoriseRoles([1]),
      this.controller.create.bind(this.controller)
    );

    this.router.patch(
      "/:id",
      MiddlewareFactory.authoriseRoles([1]),
      this.controller.update.bind(this.controller)
    );

    this.router.delete(
      "/:id",
      MiddlewareFactory.authoriseRoles([1]),
      this.controller.delete.bind(this.controller)
    );

    return this.router;
  }
}

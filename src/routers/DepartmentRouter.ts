import { Router } from "express";
import { DepartmentController } from "../controller/controllers/DepartmentController";
import { MiddlewareFactory } from "../middlewares/MiddlewareFactory";
import { IRouter } from "./IRouter";

export class DepartmentRouter implements IRouter {
  routeName = "Department";
  basePath = "/api/departments";
  authenticate = true;

  constructor(
    private readonly router: Router,
    private readonly controller: DepartmentController
  ) {}

  getRouter(): Router {
    this.router.use(MiddlewareFactory.authenticateToken);

    this.router.get(
      "/",
      MiddlewareFactory.authoriseRoles([1]),
      this.controller.getAll.bind(this.controller)
    );

    this.router.post(
      "/",
      MiddlewareFactory.authoriseRoles([1]),
      this.controller.create.bind(this.controller)
    );

    this.router.get(
      "/users",
      MiddlewareFactory.authoriseRoles([1, 2]),
      this.controller.getUsersInDepartment.bind(this.controller)
    );

    return this.router;
  }
}

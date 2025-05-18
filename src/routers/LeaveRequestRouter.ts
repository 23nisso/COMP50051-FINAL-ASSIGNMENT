import { Router } from "express";
import { LeaveRequestController } from "../controller/controllers/LeaveRequestController";
import { MiddlewareFactory } from "../middlewares/MiddlewareFactory";
import { IRouter } from "./IRouter";

export class LeaveRequestRouter implements IRouter {
  routeName = "LeaveRequest";
  basePath = "/api/leave-requests";
  authenticate = true;

  constructor(
    private readonly router: Router,
    private readonly controller: LeaveRequestController
  ) {}

  getRouter(): Router {
    this.router.use(MiddlewareFactory.authenticateToken);

    this.router.post(
      "/",
      MiddlewareFactory.authoriseRoles([1, 3]),
      this.controller.create.bind(this.controller)
    );

    this.router.get(
      "/pending",
      MiddlewareFactory.authoriseRoles([1, 2]),
      this.controller.getPendingRequests.bind(this.controller)
    );

    this.router.patch(
      "/:id/approve",
      MiddlewareFactory.authoriseRoles([1, 2]),
      this.controller.approved.bind(this.controller)
    );

    this.router.patch(
      "/:id/reject",
      MiddlewareFactory.authoriseRoles([1, 2]),
      this.controller.rejected.bind(this.controller)
    );

    this.router.delete(
      "/",
      MiddlewareFactory.authoriseRoles([1, 3]),
      this.controller.cancelled.bind(this.controller)
    );

    this.router.get(
      "/status/:id",
      MiddlewareFactory.authoriseRoles([3]),
      this.controller.getMyRequests.bind(this.controller)
    );

    return this.router;
  }
}

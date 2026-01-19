import { Router } from "express";
import { LeaveRequestController } from "../controller/controllers/LeaveRequestController";
import { MiddlewareFactory } from "../middlewares/MiddlewareFactory";
import { IRouter } from "./IRouter";

export class LeaveRequestRouter implements IRouter {
  public routeName = "Leave Requests";
  public basePath = "/api/leave-requests";
  public authenticate = true;

  private router: Router;
  private controller: LeaveRequestController;

  constructor() {
    this.router = Router();
    this.controller = new LeaveRequestController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // =========================
    // CREATE (EMPLOYEE + ADMIN)
    // =========================
    this.router.post(
      "/",
      MiddlewareFactory.authoriseRoles([1, 3]),
      this.controller.create
    );

    // =========================
    // GET MY REQUESTS (EMPLOYEE)
    // =========================
    this.router.get(
      "/",
      MiddlewareFactory.authoriseRoles([3]),
      this.controller.getMyRequests
    );

    // =========================
    // GET PENDING (MANAGER + ADMIN)
    // =========================
    this.router.get(
      "/pending",
      MiddlewareFactory.authoriseRoles([1, 2]),
      this.controller.getPendingRequests
    );

    // =========================
    // APPROVE (MANAGER + ADMIN)
    // =========================
    this.router.patch(
      "/:id/approve",
      MiddlewareFactory.authoriseRoles([1, 2]),
      this.controller.approved
    );

    // =========================
    // REJECT (MANAGER + ADMIN)
    // =========================
    this.router.patch(
      "/:id/reject",
      MiddlewareFactory.authoriseRoles([1, 2]),
      this.controller.rejected
    );

    // =========================
    // CANCEL (ALL ROLES)
    // =========================
    this.router.delete(
      "/:id",
      MiddlewareFactory.authoriseRoles([1, 2, 3]),
      this.controller.cancelled
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
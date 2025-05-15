import { Router } from "express";
import { LoginController } from "../controller/controllers/LoginController";
import { IRouter } from "./IRouter";

export class LoginRouter implements IRouter {
  public readonly routeName = "login";
  public readonly basePath = "/api/login";
  public readonly authenticate = false;

  constructor(
    private readonly router: Router,
    private readonly controller: LoginController
  ) {
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post("/", this.controller.login.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}

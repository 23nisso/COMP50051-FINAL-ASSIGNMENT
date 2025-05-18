import { Router } from 'express';
import { UserManagementController } from '../controller/controllers/UserManagementController';
import { IRouter } from './IRouter';

export class UserManagementRouter implements IRouter {
  routeName = 'user_management';
  basePath = '/api/user-management';
  authenticate = true;

  constructor(
    private readonly router: Router,
    private readonly controller: UserManagementController
  ) {}

  getRouter(): Router {
    this.router.get("/", this.controller.getAll.bind(this.controller));
    this.router.post("/", this.controller.create.bind(this.controller));
  return this.router;
}
}
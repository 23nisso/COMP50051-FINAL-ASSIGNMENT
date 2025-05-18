import { Router } from 'express';
import { LeaveTypeController } from '../controller/controllers/LeaveTypeController';
import { IRouter } from './IRouter';

export class LeaveTypeRouter implements IRouter {
  routeName = 'leave_type';
  basePath = '/api/leave-types';
  authenticate = true;

  constructor(
    private readonly router: Router,
    private readonly controller: LeaveTypeController
  ) {}

  getRouter(): Router {
      this.router.get("/", this.controller.getAll.bind(this.controller));
      this.router.post("/", this.controller.create.bind(this.controller));
    return this.router;
  }
}
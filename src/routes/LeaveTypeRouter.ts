import { Router } from 'express';
import { LeaveTypeController } from '../controller/controllers/LeaveTypeController';
import { IRouter } from './IRouter';

export class LeaveTypeRouter implements IRouter {
  routeName = 'leave_type';
  basePath = '/api/leavetypes';
  authenticate = true;

  constructor(
    private readonly router: Router,
    private readonly controller: LeaveTypeController
  ) {}

  getRouter(): Router {
    this.router.get(`${this.basePath}`, this.controller.getAll.bind(this.controller));
    this.router.post(`${this.basePath}`, this.controller.create.bind(this.controller));
    return this.router;
  }
}
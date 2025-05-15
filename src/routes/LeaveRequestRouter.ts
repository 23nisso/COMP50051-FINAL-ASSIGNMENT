import { Router } from 'express';
import { LeaveRequestController } from '../controller/controllers/LeaveRequestController';
import { IRouter } from './IRouter';

export class LeaveRequestRouter implements IRouter {
  routeName = 'leave_request';
  basePath = '/api/leaverequests';
  authenticate = true;

  constructor(
    private readonly router: Router,
    private readonly controller: LeaveRequestController
  ) {}

  getRouter(): Router {
    this.router.get(`${this.basePath}`, this.controller.getAll.bind(this.controller));
    this.router.post(`${this.basePath}`, this.controller.create.bind(this.controller));
    return this.router;
  }
}
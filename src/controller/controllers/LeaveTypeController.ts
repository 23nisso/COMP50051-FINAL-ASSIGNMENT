import { Request, Response } from 'express';
import { LeaveType } from '../../entities/LeaveType';
import { AppDataSource } from '../../data-source';
import { Repository } from 'typeorm';
import { ResponseHandler } from '../../helpers/handlers/ResponseHandler';

export class LeaveTypeController {
  private readonly repo: Repository<LeaveType>;

  constructor() {
    this.repo = AppDataSource.getRepository(LeaveType);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.repo.find();
      ResponseHandler.sendSuccessResponse(res, data);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 500, 'Failed to fetch leave types');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const leaveTypeId = this.repo.create(req.body);
      const result = await this.repo.save(leaveTypeId);
      ResponseHandler.sendSuccessResponse(res, result, 201);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 400, 'Failed to create leave type');
    }
  }
}

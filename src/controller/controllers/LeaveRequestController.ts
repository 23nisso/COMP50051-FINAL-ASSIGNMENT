import { Request, Response } from 'express';
import { LeaveRequest } from '../../entities/LeaveRequest';
import { AppDataSource } from '../../data-source';
import { Repository } from 'typeorm';
import { ResponseHandler } from '../../helpers/handlers/ResponseHandler';

export class LeaveRequestController {
  private readonly repo: Repository<LeaveRequest>;

  constructor() {
    this.repo = AppDataSource.getRepository(LeaveRequest);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.repo.find({ relations: ['user', 'leaveTypeId'] });
      ResponseHandler.sendSuccessResponse(res, data);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 500, 'Failed to retrieve leave requests. Ensure the database connection is established and the query is valid.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const newRequest = this.repo.create(req.body);
      const result = await this.repo.save(newRequest);
      ResponseHandler.sendSuccessResponse(res, result, 201);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 400, 'Failed to create leave request. Ensure all required fields are provided and valid.');
    }
  }
}

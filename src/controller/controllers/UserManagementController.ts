import { Request, Response } from 'express';
import { UserManagement } from '../../entities/UserManagement';
import { AppDataSource } from '../../data-source';
import { Repository } from 'typeorm';
import { ResponseHandler } from '../../helpers/handlers/ResponseHandler';

export class UserManagementController {
  private readonly repo: Repository<UserManagement>;

  constructor() {
    this.repo = AppDataSource.getRepository(UserManagement);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.repo.find({ relations: ['user', 'manager'] });
      ResponseHandler.sendSuccessResponse(res, data);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 500, 'Failed to fetch manager assignments');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const assignment = this.repo.create(req.body);
      const result = await this.repo.save(assignment);
      ResponseHandler.sendSuccessResponse(res, result, 201);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 400, 'Failed to create manager-user relationship');
    }
  }
}

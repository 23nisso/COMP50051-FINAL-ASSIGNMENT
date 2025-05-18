import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { UserManagement } from "../../entities/UserManagement";
import { User } from "../../entities/User";
import { Repository } from "typeorm";
import { ResponseHandler } from "../../helpers/handlers/ResponseHandler";

export class UserManagementController {
  private readonly repo: Repository<UserManagement>;

  constructor() {
    this.repo = AppDataSource.getRepository(UserManagement);
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, managerId, startDate } = req.body;

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ userId });
      const manager = await userRepo.findOneBy({ userId: managerId });

      if (!user || !manager) {
        return ResponseHandler.sendErrorResponse(res, 404, "User or Manager not found.");
      }

      const entry = new UserManagement();
      entry.user = user;
      entry.manager = manager;
      entry.startDate = new Date(startDate);

      const saved = await this.repo.save(entry);
      ResponseHandler.sendSuccessResponse(res, saved, 201);
    } catch (error) {
      console.error(error);
      ResponseHandler.sendErrorResponse(res, 500, "Failed to create user-management entry.");
    }
  };

  public getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const entries = await this.repo.find({ relations: ["user", "manager"] });
      ResponseHandler.sendSuccessResponse(res, entries);
    } catch (error) {
      console.error(error);
      ResponseHandler.sendErrorResponse(res, 500, "Failed to retrieve user-management records.");
    }
  };
}

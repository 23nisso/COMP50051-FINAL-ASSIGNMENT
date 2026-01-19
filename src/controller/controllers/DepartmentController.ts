import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Department } from "../../entities/Department";
import { ResponseHandler } from "../../helpers/handlers/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { User } from "../../entities/User";
import { IAuthenticatedJWTRequest } from "../interfaces/IAuthenticatedJWTRequest";

export class DepartmentController {

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const departments = await AppDataSource.getRepository(Department).find();
    ResponseHandler.sendSuccessResponse(res, departments);
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;
    const department = new Department();
    department.name = name;

    await AppDataSource.getRepository(Department).save(department);
    ResponseHandler.sendSuccessResponse(res, department, StatusCodes.CREATED);
  };
  public async getUsersInDepartment(
    req: IAuthenticatedJWTRequest,
    res: Response
  ): Promise<void> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const roleId = req.signedInUser?.roleId;
      const userId = req.signedInUser?.userId;

      if (!roleId || !userId) {
        return ResponseHandler.sendErrorResponse(res, 401, "Unauthorised");
      }

      if (roleId === 1) {
        const users = await userRepo.find({
          relations: ["role", "department"]
        });

        return ResponseHandler.sendSuccessResponse(res, users);
      }

      const manager = await userRepo.findOne({
        where: { userId },
        relations: ["department"]
      });

      if (!manager || !manager.department) {
        return ResponseHandler.sendErrorResponse(res, 404, "Manager department not found");
      }

      const users = await userRepo.find({
        where: { department: { departmentId: manager.department.departmentId } },
        relations: ["role", "department"]
      });

      ResponseHandler.sendSuccessResponse(res, users);

    } catch (error) {
      console.error(error);
      ResponseHandler.sendErrorResponse(res, 500, "Failed to retrieve department employees.");
    }
  }
}

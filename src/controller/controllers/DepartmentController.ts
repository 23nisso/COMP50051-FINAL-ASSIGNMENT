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

  public async getUsersInDepartment(req: IAuthenticatedJWTRequest, res: Response): Promise<void> {
  try {
    const managerId = req.signedInUser?.userId;

    if (!managerId) {
      return ResponseHandler.sendErrorResponse(res, 400, "Manager ID missing from token.");
    }

    const userRepo = AppDataSource.getRepository(User);

    const manager = await userRepo.findOne({
      where: { userId: managerId },
      relations: ["department"]
    });

    if (!manager || !manager.department) {
      return ResponseHandler.sendErrorResponse(res, 404, "Manager's department not found.");
    }

    const departmentId = manager.department.departmentId;

    const employees = await userRepo.find({
      where: {
        department: { departmentId }
      },
      relations: ["role", "department"]
    });

    ResponseHandler.sendSuccessResponse(res, employees);
  } catch (error) {
    console.error(error);
    ResponseHandler.sendErrorResponse(res, 500, "Failed to retrieve department employees.");
  }
};
}
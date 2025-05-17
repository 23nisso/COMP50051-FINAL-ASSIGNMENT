import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Department } from "../../entities/Department";
import { ResponseHandler } from "../../helpers/handlers/ResponseHandler";
import { StatusCodes } from "http-status-codes";

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

  public getUsersInDepartment = async (req: Request, res: Response): Promise<void> => {
    const departmentId = parseInt(req.params.id);
    const department = await AppDataSource.getRepository(Department).find({
      where: { departmentId },
      relations: ["users"]
    });
    if (department.length === 0) {
      ResponseHandler.sendErrorResponse(res, 404, "Department not found");
    } else {
      ResponseHandler.sendSuccessResponse(res, department[0].users);
    }
  };
}
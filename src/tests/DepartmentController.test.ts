import { DepartmentController } from "../controller/controllers/DepartmentController";
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ResponseHandler } from "../helpers/handlers/ResponseHandler";

jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock("../helpers/handlers/ResponseHandler", () => ({
  ResponseHandler: {
    sendSuccessResponse: jest.fn(),
    sendErrorResponse: jest.fn(),
  },
}));

describe("DepartmentController", () => {
  let controller: DepartmentController;
  let req: any;
  let res: Response;
  let mockUserRepo: any;

  beforeEach(() => {
    controller = new DepartmentController();
    req = { signedInUser: { userId: 1 } } as any;
    res = {} as Response;

    mockUserRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepo);
    jest.clearAllMocks();
  });

  describe("getUsersInDepartment", () => {
    it("should return department users if manager has a department", async () => {
      const mockManager = {
        department: { departmentId: 5 },
      };
      const mockUsers = [{ userId: 2 }, { userId: 3 }];

      mockUserRepo.findOne.mockResolvedValue(mockManager);
      mockUserRepo.find.mockResolvedValue(mockUsers);

      await controller.getUsersInDepartment(req, res);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ["department"],
      });

      expect(mockUserRepo.find).toHaveBeenCalledWith({
        where: { department: { departmentId: 5 } },
        relations: ["role", "department"],
      });

      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, mockUsers);
    });

    it("should handle error if manager has no department", async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await controller.getUsersInDepartment(req, res);

      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 404, "Manager's department not found.");
    });

    it("should handle exceptions", async () => {
      mockUserRepo.findOne.mockRejectedValue(new Error("fail"));

      await controller.getUsersInDepartment(req, res);

      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 500, "Failed to retrieve department employees.");
    });
  });
});
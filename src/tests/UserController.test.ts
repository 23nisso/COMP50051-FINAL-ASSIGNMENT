import { UserController } from "../../src/controller/controllers/UserController";
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entities/User";
import { ResponseHandler } from "../../src/helpers/handlers/ResponseHandler";
import { Request, Response } from "express";
import { Repository } from "typeorm";
import { validate } from "class-validator";

jest.mock("class-validator", () => ({
  ...jest.requireActual("class-validator"),
  validate: jest.fn()
}));

jest.mock("../../src/helpers/handlers/ResponseHandler");

jest.mock("../../src/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

const mockReq = {
  params: { id: "1" },
  body: {
    roleId: 1,
    departmentId: 1,
    firstName: "John",
    surname: "Doe",
    officeLocation: "London",
    officeName: "HQ",
    email: "john@example.com",
    password: "1234567890",
    annualLeaveBalance: 25
  },
  signedInUser: { userId: 1, roleId: "manager" }
} as unknown as Request;

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as unknown as Response;

describe("UserController", () => {
  let controller: UserController;
  let mockUserRepo: Partial<Repository<User>>;

  beforeEach(() => {
    mockUserRepo = {
      find: jest.fn().mockResolvedValue([{ userId: 1, email: "john@example.com" }]),
      findOne: jest.fn().mockResolvedValue({ userId: 1, firstName: "John", surname: "Doe", department: { departmentId: 1 }, annualLeaveBalance: 25 }),
      save: jest.fn().mockResolvedValue({ userId: 1, email: "john@example.com" }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      findOneBy: jest.fn().mockResolvedValue({ userId: 1 })
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepo);

    (validate as jest.Mock).mockResolvedValue([]);

    controller = new UserController();
  });

  it("should return all users", async () => {
    await controller.getAll({} as Request, mockRes);
    expect(mockUserRepo.find).toHaveBeenCalled();
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

  it("should create a new user", async () => {
    await controller.create(mockReq, mockRes);
    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(mockRes, expect.any(Object), 201);
  });

  it("should return BAD_REQUEST if no password", async () => {
    const badReq = { ...mockReq, body: { ...mockReq.body, password: "" } } as Request;
    (validate as jest.Mock).mockResolvedValue([{ constraints: { isNotEmpty: "Password is required" } }]);

    await controller.create(badReq, mockRes);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalled();
  });

  it("should delete a user", async () => {
    await controller.delete({ params: { id: "1" } } as Request, mockRes);
    expect(mockUserRepo.delete).toHaveBeenCalledWith("1");
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

  it("should update a user", async () => {
    await controller.update({ ...mockReq, params: { id: "1" } }, mockRes);
    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

  it("should get leave balance", async () => {
    await controller.getLeaveBalance({ ...mockReq, params: { id: "1" } }, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(mockRes, expect.objectContaining({ remainingLeave: 25 }));
  });
});
import { RoleController } from "../../src/controller/controllers/RoleController";
import { AppDataSource } from "../../src/data-source";
import { Role } from "../../src/entities/Role";
import { ResponseHandler } from "../../src/helpers/handlers/ResponseHandler";
import { Request, Response } from "express";
import { Repository } from "typeorm";
import { validate } from "class-validator";

jest.mock("../../src/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

jest.mock("../../src/helpers/handlers/ResponseHandler");
jest.mock("class-validator", () => ({
  ...jest.requireActual("class-validator"),
  validate: jest.fn()
}));

describe("RoleController", () => {
  let controller: RoleController;
  let mockRepo: Partial<Repository<Role>>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
    controller = new RoleController();

    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it("getAll - should return NO_CONTENT if no roles found", async () => {
    (mockRepo.find as jest.Mock).mockResolvedValue([]);
    await controller.getAll(req as Request, res as Response);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 204);
  });

  it("getAll - should return roles", async () => {
    const roles = [{ roleId: 1, name: "Manager" }];
    (mockRepo.find as jest.Mock).mockResolvedValue(roles);
    await controller.getAll(req as Request, res as Response);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, roles);
  });

  it("getById - invalid ID format", async () => {
    req.params.id = "abc";
    await controller.getById(req as Request, res as Response);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalled();
  });

  it("getById - role not found", async () => {
    req.params.id = "5";
    (mockRepo.findOne as jest.Mock).mockResolvedValue(null);
    await controller.getById(req as Request, res as Response);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalled();
  });

  it("getById - role found", async () => {
    req.params.id = "1";
    const role = { roleId: 1, name: "Admin" };
    (mockRepo.findOne as jest.Mock).mockResolvedValue(role);
    await controller.getById(req as Request, res as Response);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, role);
  });

  it("create - invalid role object", async () => {
    req.body.name = "";
    (validate as jest.Mock).mockResolvedValue([{ constraints: { isNotEmpty: "Name is required" } }]);
    await expect(controller.create(req as Request, res as Response)).rejects.toThrow("Name is required");
  });

  it("create - valid role", async () => {
    req.body.name = "Manager";
    (validate as jest.Mock).mockResolvedValue([]);
    const savedRole = { roleId: 10, name: "Manager" };
    (mockRepo.save as jest.Mock).mockResolvedValue(savedRole);

    await controller.create(req as Request, res as Response);
    expect(mockRepo.save).toHaveBeenCalled();
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, savedRole, 201);
  });

  it("update - missing ID", async () => {
    req.body = {};
    await expect(controller.update(req as Request, res as Response)).rejects.toThrow("No ID provided");
  });

  it("update - role not found", async () => {
    req.body = { id: 5 };
    (mockRepo.findOneBy as jest.Mock).mockResolvedValue(null);
    await expect(controller.update(req as Request, res as Response)).rejects.toThrow("Role not found");
  });

  it("update - valid update", async () => {
    req.body = { id: 5, name: "Updated" };
    const found = { roleId: 5, name: "Old" };
    (mockRepo.findOneBy as jest.Mock).mockResolvedValue(found);
    (validate as jest.Mock).mockResolvedValue([]);
    (mockRepo.save as jest.Mock).mockResolvedValue({ roleId: 5, name: "Updated" });

    await controller.update(req as Request, res as Response);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

  it("delete - no ID", async () => {
    req.params = {};
    await expect(controller.delete(req as Request, res as Response)).rejects.toThrow("No ID provided");
  });

  it("delete - not found", async () => {
    req.params = { id: "55" };
    (mockRepo.delete as jest.Mock).mockResolvedValue({ affected: 0 });
    await expect(controller.delete(req as Request, res as Response)).rejects.toThrow("Role with the provided ID not found");
  });

  it("delete - successful", async () => {
    req.params = { id: "1" };
    (mockRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });
    await controller.delete(req as Request, res as Response);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, "Role deleted");
  });
});
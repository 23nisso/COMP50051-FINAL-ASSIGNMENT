import { Request, Response } from "express";
import { UserManagementController } from "../controller/controllers/UserManagementController";
import { User } from "../entities/User";
import { UserManagement } from "../entities/UserManagement";
import { AppDataSource } from "../data-source";
import { ResponseHandler } from "../helpers/handlers/ResponseHandler";

jest.mock("../../src/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock("../../src/helpers/handlers/ResponseHandler", () => ({
  ResponseHandler: {
    sendSuccessResponse: jest.fn(),
    sendErrorResponse: jest.fn(),
  },
}));

describe("UserManagementController", () => {
  let controller: UserManagementController;
  let mockRepo: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockRepo = { save: jest.fn(), find: jest.fn() };
    mockUserRepo = { findOneBy: jest.fn() };

    (AppDataSource.getRepository as jest.Mock)
      .mockImplementationOnce(() => mockRepo)  // for UserManagement
      .mockImplementation(() => mockUserRepo); // for User

    controller = new UserManagementController();
    (controller as any)["repo"] = mockRepo;
  });

  describe("create", () => {
    it("creates a user-management entry successfully", async () => {
      const req = {
        body: { userId: 1, managerId: 2, startDate: "2024-01-01" },
      } as Request;
      const res = {} as Response;

      mockUserRepo.findOneBy
        .mockResolvedValueOnce({ userId: 1 })  // user
        .mockResolvedValueOnce({ userId: 2 }); // manager

      const savedEntry = { user: {}, manager: {}, startDate: new Date("2024-01-01") };
      mockRepo.save.mockResolvedValue(savedEntry);

      await controller.create(req, res);

      expect(mockRepo.save).toHaveBeenCalled();
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, savedEntry, 201);
    });

    it("returns 404 if user or manager not found", async () => {
      const req = {
        body: { userId: 1, managerId: 2, startDate: "2024-01-01" },
      } as Request;
      const res = {} as Response;

      mockUserRepo.findOneBy.mockResolvedValueOnce(null);

      await controller.create(req, res);

      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 404, "User or Manager not found.");
    });

    it("handles unexpected errors during creation", async () => {
      const req = {
        body: { userId: 1, managerId: 2, startDate: "2024-01-01" },
      } as Request;
      const res = {} as Response;

      mockUserRepo.findOneBy.mockImplementation(() => {
        throw new Error("unexpected");
      });

      await controller.create(req, res);

      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 500, "Failed to create user-management entry.");
    });
  });

  describe("getAll", () => {
    it("returns all user-manager relationships", async () => {
      const req = {} as Request;
      const res = {} as Response;

      const entries = [{}, {}];
      mockRepo.find.mockResolvedValue(entries);

      await controller.getAll(req, res);

      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, entries);
    });

    it("handles errors when fetching all", async () => {
      const req = {} as Request;
      const res = {} as Response;

      mockRepo.find.mockRejectedValue(new Error("fail"));

      await controller.getAll(req, res);

      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, 500, "Failed to retrieve user-management records.");
    });
  });
});
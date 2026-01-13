import { LeaveTypeController } from "../controller/controllers/LeaveTypeController";
import { AppDataSource } from "../data-source";
import { LeaveType } from "../entities/LeaveType";
import { ResponseHandler } from "../helpers/handlers/ResponseHandler";
import { Request, Response } from "express";
import { Repository } from "typeorm";

jest.mock("../../src/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

jest.mock("../../src/helpers/handlers/ResponseHandler");

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as unknown as Response;

describe("LeaveTypeController", () => {
  let controller: LeaveTypeController;
  let mockRepo: Partial<Repository<LeaveType>>;

  beforeEach(() => {
    mockRepo = {
      find: jest.fn().mockResolvedValue([{ leaveTypeId: 1, leaveType: "Annual Leave" }]),
      create: jest.fn().mockReturnValue({ leaveType: "Study Leave" }),
      save: jest.fn().mockResolvedValue({ leaveTypeId: 2, leaveType: "Study Leave" }),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
    controller = new LeaveTypeController();
  });

  describe("getAll", () => {
    it("should return list of leave types", async () => {
      const req = {} as Request;

      await controller.getAll(req, mockRes);

      expect(mockRepo.find).toHaveBeenCalled();
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
        mockRes,
        [{ leaveTypeId: 1, leaveType: "Annual Leave" }]
      );
    });

    it("should handle error and return 500", async () => {
      (mockRepo.find as jest.Mock).mockRejectedValue(new Error("Failed"));

      await controller.getAll({} as Request, mockRes);

      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
        mockRes,
        500,
        "Failed to fetch leave types. Please try again later."
      );
    });
  });

  describe("create", () => {
    it("should create and return new leave type", async () => {
      const req = {
        body: {
          leaveType: "Study Leave",
          description: "Time off for exams",
          initialBalance: 10,
          maxRolloverDays: 2
        }
      } as Request;

      await controller.create(req, mockRes);

      expect(mockRepo.create).toHaveBeenCalledWith(req.body);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
        mockRes,
        { leaveTypeId: 2, leaveType: "Study Leave" },
        201
      );
    });

    it("should handle save errors", async () => {
      (mockRepo.save as jest.Mock).mockRejectedValue(new Error("Save failed"));

      const req = {
        body: {
          leaveType: "Invalid"
        }
      } as Request;

      await controller.create(req, mockRes);

      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
        mockRes,
        400,
        "Failed to create leave type. Please check your input."
      );
    });
  });
});
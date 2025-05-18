import { LeaveRequestController } from "../../src/controller/controllers/LeaveRequestController";
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entities/User";
import { LeaveType } from "../../src/entities/LeaveType";
import { LeaveRequest } from "../../src/entities/LeaveRequest";
import { UserManagement } from "../../src/entities/UserManagement";
import { ResponseHandler } from "../../src/helpers/handlers/ResponseHandler";
import { Request, Response } from "express";
import { Repository } from "typeorm";

jest.mock("../../src/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

jest.mock("../../src/helpers/handlers/ResponseHandler");

const mockReq = {
  body: {
    userId: 1,
    leaveTypeId: 2,
    startDate: "2025-06-01",
    endDate: "2025-06-07",
    reason: "Holiday",
    leaveRequestId: 1
  },
  params: {
    id: "1"
  },
  signedInUser: {
    userId: 99
  }
} as unknown as Request;

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as unknown as Response;

describe("LeaveRequestController", () => {
  let controller: LeaveRequestController;
  let mockLeaveRequestRepo: Partial<Repository<LeaveRequest>>;
  let mockUserRepo: Partial<Repository<User>>;
  let mockLeaveTypeRepo: Partial<Repository<LeaveType>>;
  let mockUserManagementRepo: Partial<Repository<UserManagement>>;

  beforeEach(() => {
    mockLeaveRequestRepo = {
      save: jest.fn().mockResolvedValue({ leaveRequestId: 1 }),
      find: jest.fn().mockResolvedValue([{ leaveRequestId: 1 }]),
      findOne: jest.fn().mockResolvedValue({
        leaveRequestId: 1,
        user: { userId: 1 },
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-06-05"),
        status: "Pending"
      }),
      update: jest.fn()
    };

    mockUserRepo = {
      findOneBy: jest.fn().mockResolvedValue({ userId: 1, annualLeaveBalance: 10 }),
      createQueryBuilder: jest.fn().mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ userId: 1, password: "xxx", salt: "yyy", annualLeaveBalance: 10 })
      })
    };

    mockLeaveTypeRepo = {
      findOneBy: jest.fn().mockResolvedValue({ leaveTypeId: 2 })
    };

    mockUserManagementRepo = {
      find: jest.fn().mockResolvedValue([{ user: { userId: 1 } }])
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === LeaveRequest) return mockLeaveRequestRepo;
      if (entity === User) return mockUserRepo;
      if (entity === LeaveType) return mockLeaveTypeRepo;
      if (entity === UserManagement) return mockUserManagementRepo;
    });

    controller = new LeaveRequestController();
  });

  it("should create a new leave request", async () => {
    await controller.create(mockReq, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

  it("should return 400 if required fields missing", async () => {
    await controller.create({ body: {} } as Request, mockRes);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 400, expect.stringContaining("All required fields"));
  });

  it("should return 404 if user or leaveType not found", async () => {
    (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue(null);
    await controller.create(mockReq, mockRes);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 404, expect.any(String));
  });

  it("should approve a pending request", async () => {
    await controller.approved(mockReq, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

  it("should reject a pending request", async () => {
    await controller.rejected(mockReq, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

  it("should cancel a pending request", async () => {
    await controller.cancelled(mockReq, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

  it("should get manager pending requests", async () => {
    await controller.getPendingRequests(mockReq, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });

  it("should get current user's leave requests", async () => {
    await controller.getMyRequests(mockReq, mockRes);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalled();
  });
});
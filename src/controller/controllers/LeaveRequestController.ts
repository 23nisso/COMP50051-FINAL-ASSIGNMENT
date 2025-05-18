import { Request, Response } from 'express';
import { LeaveRequest } from '../../entities/LeaveRequest';
import { User } from '../../entities/User';
import { LeaveType } from '../../entities/LeaveType';
import { AppDataSource } from '../../data-source';
import { Repository, In } from 'typeorm';
import { ResponseHandler } from '../../helpers/handlers/ResponseHandler';
import { IAuthenticatedJWTRequest } from '../../types/IAuthenticatedJWTRequest';
import { UserManagement } from "../../entities/UserManagement";

export class LeaveRequestController {
  private readonly repo: Repository<LeaveRequest>;

  constructor() {
    this.repo = AppDataSource.getRepository(LeaveRequest);
  }

async getAll(req: Request, res: Response): Promise<void> {
  try {
    const data = await this.repo.find({ relations: ['user', 'leaveType'] });
      ResponseHandler.sendSuccessResponse(res, data);
  } catch (error) {
      ResponseHandler.sendErrorResponse(res, 500, 'Failed to retrieve leave requests. Ensure the database connection is established and the query is valid.');
    }
  }

async create(req: Request, res: Response): Promise<void> {
  try {
    const { userId, leaveTypeId, startDate, endDate, reason } = req.body;

    if (!userId || !leaveTypeId || !startDate || !endDate) {
      return ResponseHandler.sendErrorResponse(res, 400, "All required fields must be provided.");
    }

    const userRepo = AppDataSource.getRepository(User);
    const leaveTypeRepo = AppDataSource.getRepository(LeaveType);

    const user = await userRepo.findOneBy({ userId });
    const leaveType = await leaveTypeRepo.findOneBy({ leaveTypeId });

    if (!user || !leaveType) {
      return ResponseHandler.sendErrorResponse(res, 404, "User or Leave Type not found.");
    }

    const newRequest = new LeaveRequest();
    newRequest.user = user;
    newRequest.leaveType = leaveType;
    newRequest.startDate = new Date(startDate);
    newRequest.endDate = new Date(endDate);
    newRequest.reason = reason || null;

    const result = await this.repo.save(newRequest);
    ResponseHandler.sendSuccessResponse(res, result, 201);
  } catch (error) {
    console.error(error);
    ResponseHandler.sendErrorResponse(res, 400, "Failed to create leave request. Ensure all required fields are valid.");
  }
}
  public getPendingRequests = async (req: IAuthenticatedJWTRequest, res: Response): Promise<void> => {
  const managerId = req.signedInUser?.userId;

  const userManagementRepo = AppDataSource.getRepository(UserManagement);
  const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);

  const teamAssignments = await userManagementRepo.find({
    where: { manager: { userId: managerId } },
    relations: ["user"]
  });

  const teamUserIds = teamAssignments.map(entry => entry.user.userId);

  const pendingRequests = await leaveRequestRepo.find({
    where: {
      status: "Pending",
      user: { userId: In(teamUserIds) }
    },
    relations: ["user", "leaveType"]
  });

  ResponseHandler.sendSuccessResponse(res, pendingRequests);
};

public approved = async (req: Request, res: Response): Promise<void> => {
  const requestId = parseInt(req.params.id);

  try {
    const leaveRequest = await this.repo.findOne({
      where: { leaveRequestId: requestId },
      relations: ["user"],
    });

    if (!leaveRequest) {
      return ResponseHandler.sendErrorResponse(res, 404, "Leave request not found.");
    }

    if (leaveRequest.status !== "Pending") {
      return ResponseHandler.sendErrorResponse(res, 400, "Only pending requests can be approved.");
    }

    const start = new Date(leaveRequest.startDate);
    const end = new Date(leaveRequest.endDate);
    const oneDay = 1000 * 60 * 60 * 24;
    const daysRequested = Math.ceil((end.getTime() - start.getTime()) / oneDay) + 1;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
      .createQueryBuilder("user")
      .addSelect(["user.password", "user.salt"])
      .where("user.userId = :id", { id: leaveRequest.user.userId })
      .getOne();

    if (!user) {
      return ResponseHandler.sendErrorResponse(res, 404, "User not found.");
    }

    if (user.annualLeaveBalance < daysRequested) {
      return ResponseHandler.sendErrorResponse(res, 400, "Insufficient leave balance.");
    }

    await userRepo.update(user.userId, {
      annualLeaveBalance: user.annualLeaveBalance - daysRequested,
    });

    leaveRequest.status = "Approved";
    await this.repo.save(leaveRequest);

    const { password, salt, ...safeUser } = user;
    const { user: _omit, ...safeLeaveRequest } = leaveRequest;

    ResponseHandler.sendSuccessResponse(res, {
      message: "Leave request approved",
      daysDeducted: daysRequested,
      updatedBalance: user.annualLeaveBalance - daysRequested,
      request: {
        ...safeLeaveRequest,
        user: safeUser,
      },
    });
  } catch (error) {
    console.error(error);
    ResponseHandler.sendErrorResponse(res, 500, "Failed to approve leave request.");
  }
};

public rejected = async (req: Request, res: Response): Promise<void> => {
  const requestId = parseInt(req.params.id);

  try {
    const leaveRequest = await this.repo.findOne({
      where: { leaveRequestId: requestId },
      relations: ["user"]
    });

    if (!leaveRequest) {
      return ResponseHandler.sendErrorResponse(res, 404, "Leave request not found.");
    }

    if (leaveRequest.status !== "Pending") {
      return ResponseHandler.sendErrorResponse(res, 400, "Only pending requests can be rejected.");
    }

    await this.repo.update(requestId, { status: "Rejected" });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
      .createQueryBuilder("user")
      .addSelect(["user.password", "user.salt"])
      .where("user.userId = :id", { id: leaveRequest.user.userId })
      .getOne();

    const { password, salt, ...safeUser } = user;
    const { user: _omit, ...safeLeaveRequest } = leaveRequest;

    ResponseHandler.sendSuccessResponse(res, {
      message: "Leave request rejected",
      request: {
        ...safeLeaveRequest,
        status: "Rejected",
        user: safeUser
      }
    });
  } catch (error) {
    console.error(error);
    ResponseHandler.sendErrorResponse(res, 500, "Failed to reject leave request.");
  }
};

public cancelled = async (req: Request, res: Response): Promise<void> => {
  const requestId = parseInt(req.body.leaveRequestId);

  try {
    const leaveRequest = await this.repo.findOne({
      where: { leaveRequestId: requestId },
      relations: ["user"]
    });

    if (!leaveRequest) {
      return ResponseHandler.sendErrorResponse(res, 404, "Leave request not found.");
    }

    if (leaveRequest.status !== "Pending") {
      return ResponseHandler.sendErrorResponse(res, 400, "Only pending requests can be cancelled.");
    }

    await this.repo.update(requestId, { status: "Cancelled" });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
      .createQueryBuilder("user")
      .addSelect(["user.password", "user.salt"])
      .where("user.userId = :id", { id: leaveRequest.user.userId })
      .getOne();

    const { password, salt, ...safeUser } = user;
    const { user: _omit, ...safeLeaveRequest } = leaveRequest;

    ResponseHandler.sendSuccessResponse(res, {
      message: "Leave request cancelled",
      request: {
        ...safeLeaveRequest,
        status: "Cancelled",
        user: safeUser
      }
    });
  } catch (error) {
    console.error(error);
    ResponseHandler.sendErrorResponse(res, 500, "Failed to cancel leave request.");
  }
};
public getMyRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.signedInUser?.userId;

    if (!userId) {
      return ResponseHandler.sendErrorResponse(res, 400, "User not authenticated.");
    }

    const myRequests = await this.repo.find({
      where: { user: { userId } },
      relations: ["leaveType"]
    });

    if (myRequests.length === 0) {
      return ResponseHandler.sendSuccessResponse(res, [], 204);
    }

    const safeRequests = myRequests.map(({ user, ...rest }) => rest);
    ResponseHandler.sendSuccessResponse(res, safeRequests);
  } catch (error) {
    console.error(error);
    ResponseHandler.sendErrorResponse(res, 500, "Failed to retrieve leave requests.");
  }
}}
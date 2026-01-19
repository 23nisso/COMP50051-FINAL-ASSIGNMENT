import { Response } from "express";
import { In, Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { LeaveRequest } from "../../entities/LeaveRequest";
import { User } from "../../entities/User";
import { LeaveType } from "../../entities/LeaveType";
import { UserManagement } from "../../entities/UserManagement";
import { ResponseHandler } from "../../helpers/handlers/ResponseHandler";
import { IAuthenticatedJWTRequest } from "../interfaces/IAuthenticatedJWTRequest";

export class LeaveRequestController {
  private repo: Repository<LeaveRequest>;

  constructor() {
    this.repo = AppDataSource.getRepository(LeaveRequest);
  }

  // =====================
  // CREATE LEAVE REQUEST
  // =====================
  public create = async (
    req: IAuthenticatedJWTRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { leaveTypeId, startDate, endDate, reason } = req.body;
      const userId = req.signedInUser?.userId;

      if (!userId || !leaveTypeId || !startDate || !endDate) {
        return ResponseHandler.sendErrorResponse(
          res,
          400,
          "All required fields must be provided."
        );
      }

      const userRepo = AppDataSource.getRepository(User);
      const leaveTypeRepo = AppDataSource.getRepository(LeaveType);

      const user = await userRepo.findOneBy({ userId });
      const leaveType = await leaveTypeRepo.findOneBy({ leaveTypeId });

      if (!user || !leaveType) {
        return ResponseHandler.sendErrorResponse(
          res,
          404,
          "User or Leave Type not found."
        );
      }

      const request = new LeaveRequest();
      request.user = user;
      request.leaveType = leaveType;
      request.startDate = new Date(startDate);
      request.endDate = new Date(endDate);
      request.reason = reason ?? null;
      request.status = "Pending";

      const saved = await this.repo.save(request);
      ResponseHandler.sendSuccessResponse(res, saved, 201);
    } catch (err) {
      console.error("Create leave request error:", err);
      ResponseHandler.sendErrorResponse(
        res,
        500,
        "Failed to create leave request."
      );
    }
  };

  // =====================
  // GET MY REQUESTS (Employee)
  // =====================
  public getMyRequests = async (
    req: IAuthenticatedJWTRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.signedInUser?.userId;
      if (!userId) {
        return ResponseHandler.sendErrorResponse(res, 401, "Unauthenticated");
      }

      const data = await this.repo.find({
        where: { user: { userId } },
        relations: ["leaveType"],
      });

      ResponseHandler.sendSuccessResponse(res, data);
    } catch (err) {
      console.error("Get my requests error:", err);
      ResponseHandler.sendErrorResponse(
        res,
        500,
        "Failed to fetch leave requests."
      );
    }
  };

  // =====================
  // GET PENDING REQUESTS (Manager)
  // =====================
  public getPendingRequests = async (
    req: IAuthenticatedJWTRequest,
    res: Response
  ): Promise<void> => {
    try {
      const managerId = req.signedInUser?.userId;
      if (!managerId) {
        return ResponseHandler.sendErrorResponse(res, 401, "Unauthenticated");
      }

      const umRepo = AppDataSource.getRepository(UserManagement);
      const assignments = await umRepo.find({
        where: { manager: { userId: managerId } },
        relations: ["user"],
      });

      const userIds = assignments.map((a) => a.user.userId);

      // If manager has no assigned users, return empty array
      if (userIds.length === 0) {
        return ResponseHandler.sendSuccessResponse(res, []);
      }

      const requests = await this.repo.find({
        where: {
          status: "Pending",
          user: { userId: In(userIds) },
        },
        relations: ["user", "leaveType"],
      });

      ResponseHandler.sendSuccessResponse(res, requests);
    } catch (err) {
      console.error("Get pending requests error:", err);
      ResponseHandler.sendErrorResponse(
        res,
        500,
        "Failed to fetch pending requests."
      );
    }
  };

  // =====================
  // APPROVE REQUEST (Manager/Admin)
  // =====================
  public approved = async (
    req: IAuthenticatedJWTRequest,
    res: Response
  ): Promise<void> => {
    try {
      // Get ID from params (URL parameter)
      const requestId = Number(req.params.id);

      console.log("Approve request - ID from params:", requestId);

      if (!requestId || isNaN(requestId)) {
        return ResponseHandler.sendErrorResponse(res, 400, "Invalid request ID.");
      }

      const leaveRequest = await this.repo.findOne({
        where: { leaveRequestId: requestId },
        relations: ["user"],
      });

      console.log("Found leave request:", leaveRequest);

      if (!leaveRequest) {
        return ResponseHandler.sendErrorResponse(
          res,
          404,
          "Leave request not found."
        );
      }

      if (leaveRequest.status !== "Pending") {
        return ResponseHandler.sendErrorResponse(
          res,
          400,
          `Cannot approve request with status: ${leaveRequest.status}`
        );
      }

      const start = new Date(leaveRequest.startDate);
      const end = new Date(leaveRequest.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({
        userId: leaveRequest.user.userId,
      });

      if (!user) {
        return ResponseHandler.sendErrorResponse(res, 404, "User not found.");
      }

      if (user.annualLeaveBalance < days) {
        return ResponseHandler.sendErrorResponse(
          res,
          400,
          `Insufficient leave balance. User has ${user.annualLeaveBalance} days, requested ${days} days.`
        );
      }

      // Update user's leave balance
      await userRepo.update(user.userId, {
        annualLeaveBalance: user.annualLeaveBalance - days,
      });

      // Update leave request status
      leaveRequest.status = "Approved";
      await this.repo.save(leaveRequest);

      ResponseHandler.sendSuccessResponse(res, {
        message: "Leave request approved",
        daysDeducted: days,
        newBalance: user.annualLeaveBalance - days,
      });
    } catch (err) {
      console.error("Approve request error:", err);
      ResponseHandler.sendErrorResponse(res, 500, "Failed to approve request.");
    }
  };

  // =====================
  // REJECT REQUEST (Manager/Admin)
  // =====================
  public rejected = async (
    req: IAuthenticatedJWTRequest,
    res: Response
  ): Promise<void> => {
    try {
      // Get ID from params (URL parameter)
      const requestId = Number(req.params.id);

      console.log("Reject request - ID from params:", requestId);

      if (!requestId || isNaN(requestId)) {
        return ResponseHandler.sendErrorResponse(res, 400, "Invalid request ID.");
      }

      const leaveRequest = await this.repo.findOneBy({
        leaveRequestId: requestId,
      });

      console.log("Found leave request:", leaveRequest);

      if (!leaveRequest) {
        return ResponseHandler.sendErrorResponse(
          res,
          404,
          "Leave request not found."
        );
      }

      if (leaveRequest.status !== "Pending") {
        return ResponseHandler.sendErrorResponse(
          res,
          400,
          `Cannot reject request with status: ${leaveRequest.status}`
        );
      }

      leaveRequest.status = "Rejected";
      await this.repo.save(leaveRequest);

      ResponseHandler.sendSuccessResponse(res, {
        message: "Leave request rejected",
      });
    } catch (err) {
      console.error("Reject request error:", err);
      ResponseHandler.sendErrorResponse(res, 500, "Failed to reject request.");
    }
  };

  // =====================
  // CANCEL REQUEST (Employee/All)
  // =====================
  public cancelled = async (
    req: IAuthenticatedJWTRequest,
    res: Response
  ): Promise<void> => {
    try {
      // Get ID from params (URL parameter)
      const requestId = Number(req.params.id);

      console.log("Cancel request - ID from params:", requestId);

      if (!requestId || isNaN(requestId)) {
        return ResponseHandler.sendErrorResponse(res, 400, "Invalid request ID.");
      }

      const leaveRequest = await this.repo.findOneBy({
        leaveRequestId: requestId,
      });

      console.log("Found leave request:", leaveRequest);

      if (!leaveRequest) {
        return ResponseHandler.sendErrorResponse(res, 404, "Leave request not found.");
      }

      // Only allow cancelling pending requests
      if (leaveRequest.status !== "Pending") {
        return ResponseHandler.sendErrorResponse(
          res,
          400,
          `Cannot cancel request with status: ${leaveRequest.status}`
        );
      }

      leaveRequest.status = "Cancelled";
      await this.repo.save(leaveRequest);

      ResponseHandler.sendSuccessResponse(res, {
        message: "Leave request cancelled",
      });
    } catch (err) {
      console.error("Cancel request error:", err);
      ResponseHandler.sendErrorResponse(res, 500, "Failed to cancel request.");
    }
  };
}
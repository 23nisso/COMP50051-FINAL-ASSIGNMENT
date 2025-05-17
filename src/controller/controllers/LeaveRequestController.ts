import { Request, Response } from 'express';
import { LeaveRequest } from '../../entities/LeaveRequest';
import { AppDataSource } from '../../data-source';
import { Repository } from 'typeorm';
import { ResponseHandler } from '../../helpers/handlers/ResponseHandler';

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
      const newRequest = this.repo.create(req.body);
      const result = await this.repo.save(newRequest);
      ResponseHandler.sendSuccessResponse(res, result, 201);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 400, 'Failed to create leave request. Ensure all required fields are provided and valid.');
    }
  }

  public getPendingRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const pendingRequests = await this.repo.find({
        where: { status: "Pending" },
        relations: ["user", "leaveType"]
      });
      ResponseHandler.sendSuccessResponse(res, pendingRequests);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 500, "Failed to retrieve pending requests.");
    }
  };

  public approved = async (req: Request, res: Response): Promise<void> => {
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
        return ResponseHandler.sendErrorResponse(res, 400, "Only pending requests can be approved.");
      }

      leaveRequest.status = "Approved";
      await this.repo.save(leaveRequest);

      ResponseHandler.sendSuccessResponse(res, {
        message: "Leave request approved",
        request: leaveRequest
      });
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 500, "Failed to approve leave request.");
    }
  };

  public rejected = async (req: Request, res: Response): Promise<void> => {
    const requestId = parseInt(req.params.id);

    try {
      const leaveRequest = await this.repo.findOneBy({ leaveRequestId: requestId });

      if (!leaveRequest) {
        return ResponseHandler.sendErrorResponse(res, 404, "Leave request not found.");
      }

      if (leaveRequest.status !== "Pending") {
        return ResponseHandler.sendErrorResponse(res, 400, "Only pending requests can be rejected.");
      }

      leaveRequest.status = "Rejected";
      await this.repo.save(leaveRequest);

      ResponseHandler.sendSuccessResponse(res, {
        message: "Leave request rejected",
        request: leaveRequest
      });
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 500, "Failed to reject leave request.");
    }
  };

  public cancelled = async (req: Request, res: Response): Promise<void> => {
    const requestId = parseInt(req.body.leaveRequestId);

    try {
      const leaveRequest = await this.repo.findOneBy({ leaveRequestId: requestId });

      if (!leaveRequest) {
        return ResponseHandler.sendErrorResponse(res, 404, "Leave request not found.");
      }

      if (leaveRequest.status !== "Pending") {
        return ResponseHandler.sendErrorResponse(res, 400, "Only pending requests can be cancelled.");
      }

      leaveRequest.status = "Cancelled";
      await this.repo.save(leaveRequest);

      ResponseHandler.sendSuccessResponse(res, {
        message: "Leave request cancelled",
        request: leaveRequest
      });
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 500, "Failed to cancel leave request.");
    }
  };
}

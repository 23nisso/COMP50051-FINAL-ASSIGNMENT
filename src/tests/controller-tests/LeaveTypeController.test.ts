import { LeaveTypeController } from "../../../src/controller/controllers/LeaveTypeController";
import { LeaveType } from "../../../src/entities/LeaveType";
import { Repository } from "typeorm";
import { StatusCodes } from "http-status-codes";
import { ResponseHandler } from "../../../src/helpers/handlers/ResponseHandler";
import { Request, Response } from "express";
import { mock } from "jest-mock-extended";

jest.mock("../../src/helpers/handlers/ResponseHandler");

jest.mock("class-validator", () => ({
  ...jest.requireActual("class-validator"),
  validate: jest.fn(),
}));

describe("LeaveTypeController", () => {
  const mockRequest = (params = {}, body = {}): Partial<Request> => ({ params, body });
  const mockResponse = (): Partial<Response> => ({});

  let controller: LeaveTypeController;
  let mockRepo: jest.Mocked<Repository<LeaveType>>;

  beforeEach(() => {
    mockRepo = mock<Repository<LeaveType>>();
    controller = new LeaveTypeController();
    (controller as any)["leaveTypeRepository"] = mockRepo;
    jest.clearAllMocks();
  });

  it("should return 204 when no records found", async () => {
    const req = mockRequest();
    const res = mockResponse();
    mockRepo.find.mockResolvedValue([]);
    await controller.getAll(req as Request, res as Response);
    expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(res, StatusCodes.NO_CONTENT);
  });

  it("should return 200 with results", async () => {
    const record = new LeaveType();
    const req = mockRequest();
    const res = mockResponse();
    mockRepo.find.mockResolvedValue([record]);
    await controller.getAll(req as Request, res as Response);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, [record]);
  });
});
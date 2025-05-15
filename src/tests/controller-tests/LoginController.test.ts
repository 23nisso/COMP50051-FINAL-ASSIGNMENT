import { LoginController } from "../../../src/controller/controllers/LoginController";
import { User } from "../../../src/entities/User";
import { Repository } from "typeorm";
import { StatusCodes } from "http-status-codes";
import { ResponseHandler } from "../../../src/helpers/handlers/ResponseHandler";
import { Request, Response } from "express";
import * as classValidator from "class-validator";
import { mock } from "jest-mock-extended";

jest.mock("../../src/helpers/handlers/ResponseHandler");

jest.mock("class-validator", () => ({
  ...jest.requireActual("class-validator"),
  validate: jest.fn(),
}));

describe("LoginController", () => {
  const mockRequest = (params = {}, body = {}): Partial<Request> => ({ params, body });
  const mockResponse = (): Partial<Response> => ({});

  let controller: LoginController;
  let mockRepo: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    mockRepo = mock<Repository<User>>();
    controller = new LoginController();
    (controller as any)["userRepository"] = mockRepo;
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
    const record = new User();
    const req = mockRequest();
    const res = mockResponse();
    mockRepo.find.mockResolvedValue([record]);
    await controller.getAll(req as Request, res as Response);
    expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(res, [record]);
  });
});
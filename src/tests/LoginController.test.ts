import { LoginController } from "../../src/controller/controllers/LoginController";
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entities/User";
import { ResponseHandler } from "../../src/helpers/handlers/ResponseHandler";
import { PasswordHandler } from "../../src/helpers/handlers/PasswordHandler";
import { Request, Response } from "express";

jest.mock("../../src/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));
jest.mock("../../src/helpers/handlers/ResponseHandler");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked.jwt.token")
}));
jest.mock("../../src/helpers/handlers/PasswordHandler");

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as unknown as Response;

describe("LoginController", () => {
  let controller: LoginController;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn()
      }),
      find: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
    controller = new LoginController();
  });

  describe("login", () => {
    it("should return 400 if email or password is missing", async () => {
      const req = { body: {} } as Request;
      await controller.login(req, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 401 if user not found", async () => {
      const req = { body: { email: "test", password: "pass" } } as Request;
      mockRepo.createQueryBuilder().getOne.mockResolvedValue(undefined);

      await controller.login(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid email. Please try again."
      });
    });

    it("should return 401 if password is invalid", async () => {
      const req = { body: { email: "test", password: "pass" } } as Request;
      mockRepo.createQueryBuilder().getOne.mockResolvedValue({
        password: "hashed",
        salt: "salt",
        role: { roleId: 1 },
        userId: 5,
        email: "test"
      });
      (PasswordHandler.verifyPassword as jest.Mock).mockReturnValue(false);

      await controller.login(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid password. Please try again."
      });
    });

    it("should return token for valid credentials", async () => {
      const req = { body: { email: "test", password: "pass" } } as Request;
      mockRepo.createQueryBuilder().getOne.mockResolvedValue({
        password: "hashed",
        salt: "salt",
        role: { roleId: 1 },
        userId: 5,
        email: "test"
      });
      (PasswordHandler.verifyPassword as jest.Mock).mockReturnValue(true);

      await controller.login(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ token: "mocked.jwt.token" });
    });
  });

  describe("getAll", () => {
    it("should return users if available", async () => {
      mockRepo.find.mockResolvedValue([{ userId: 1 }]);

      const req = {} as Request;
      await controller.getAll(req, mockRes);

      expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(mockRes, [{ userId: 1 }]);
    });

    it("should return 204 if no users", async () => {
      mockRepo.find.mockResolvedValue([]);

      const req = {} as Request;
      await controller.getAll(req, mockRes);

      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 204);
    });

    it("should return 401 on error", async () => {
      mockRepo.find.mockRejectedValue(new Error("DB error"));

      const req = {} as Request;
      await controller.getAll(req, mockRes);

      expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(mockRes, 401, "DB error");
    });
  });
});
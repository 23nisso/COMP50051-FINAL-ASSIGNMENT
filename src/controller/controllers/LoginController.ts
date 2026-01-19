import { AppDataSource } from "../../data-source";
import { User } from "../../entities/User";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ResponseHandler } from "../../helpers/handlers/ResponseHandler";

export class LoginController {
  private userRepository = AppDataSource.getRepository(User);

  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Both email and password are required"
      );
    }

    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .leftJoinAndSelect("user.role", "role")
      .where("user.email = :email", { email })
      .getOne();

    if (!user) {
      return ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Invalid email or password"
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Invalid email or password"
      );
    }

    const token = jwt.sign(
      {
        email: user.email,
        roleId: user.role.roleId,
        userId: user.userId,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return ResponseHandler.sendSuccessResponse(res, { token });
  }
}

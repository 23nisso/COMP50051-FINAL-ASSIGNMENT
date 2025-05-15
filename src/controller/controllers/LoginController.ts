import { AppDataSource } from '../../data-source'; 
import { User } from '../../entities/User';
import { Repository } from "typeorm";
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PasswordHandler } from '../../helpers/handlers/PasswordHandler';
import { UserDTOToken } from '../data-transfer-objects/UserDTOToken'
import jwt from 'jsonwebtoken';
import { AppError } from "../../helpers/AppError";
import bcrypt from "bcryptjs";
import { ResponseHandler } from "../../helpers/handlers/ResponseHandler";


export class LoginController {
  private userRepository = AppDataSource.getRepository(User);

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await this.userRepository
  .createQueryBuilder("user")
  .addSelect("user.password")
  .addSelect("user.salt")
  .leftJoinAndSelect("user.role", "role")
  .where("user.email = :email", { email })
  .getOne();

console.log("Login attempt from:", email);
console.log("Submitted password:", password);
console.log("User's stored hash:", user.password);
console.log("User's salt:", user.salt);
console.log("Pepper used:", process.env.PEPPER);

    if (!user) {
      return res.status(401).json({ error: "Invalid email. Please try again." });
    }

    const passwordValid = PasswordHandler.verifyPassword(password, user.password, user.salt);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid password. Please try again." });
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        roleId: user.role.name,
      },
      process.env.JWT_SECRET || "hardcodedSecret",
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
  }
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userRepository.find();
      if (!users || users.length === 0) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NO_CONTENT);
        return;
      }
      ResponseHandler.sendSuccessResponse(res, users);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, error.message);
    }
  }
}


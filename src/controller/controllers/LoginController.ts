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

export class LoginController {
  private userRepository = AppDataSource.getRepository(User);

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ["role"],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        roleId: user.role.name,
      },
      process.env.JWT_SECRET || "mysecret",
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
  }
}

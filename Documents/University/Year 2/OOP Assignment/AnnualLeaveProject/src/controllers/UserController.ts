import { Request, Response } from 'express';
import { AppDataSource } from '../data-source'; 
import { User } from '../entity/User';
import { Repository } from "typeorm";
import { ResponseHandler } from '../helper/ResponseHandler';
import { StatusCodes } from 'http-status-codes';
import { validate } from "class-validator";
import { instanceToPlain } from 'class-transformer';

export class UserController {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.find({
        relations: ["role"], 
      });

      if (users.length === 0) {
        ResponseHandler.sendSuccessResponse(res, StatusCodes.NO_CONTENT); 
      }

      ResponseHandler.sendSuccessResponse(res, users);

    } catch (error) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, `Failed to retrieve users: ${error.message}`);
    }
  };

  public getByEmail = async (req: Request, res: Response): Promise<void> => {
    const email = req.params.emailAddress;

    if (!email || email.trim().length === 0) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Email is required");
      return;
    }

    try {
      const user = await this.userRepository.findOne({ where: { email: email },  
                                                    relations: ["role"]});
      if (!user) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, `User not found with email: ${email}`);
        return;
      }

      ResponseHandler.sendSuccessResponse(res, user);

    } catch (error) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, `Unable to find user with the email: {$email}`);
    }
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Invalid ID format");
      return;
    }

    try {
      const user = await this.userRepository.findOne({ where: { userId: id },  
                                                      relations: ["role"] });
      if (!user) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NO_CONTENT, `User not found with ID: ${id}`);
        return;
      }

      ResponseHandler.sendSuccessResponse(res,user);
    
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, `Error fetching user: {$error.message}`);
    }
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      let user = new User();
      user.password = req.body.password; 
      user.email = req.body.email;
      user.role = req.body.roleId;

      const errors = await validate(user);
      if (errors.length > 0) { 
         throw new Error (errors.map(err => Object.values(err.constraints || {})).join(", "));
      }

      user = await this.userRepository.save(user); 
      
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(user), StatusCodes.CREATED);

    } catch (error: any) { 
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    console.log(id);
    try {
      if (!id) {
        throw new Error("No ID provided");
      }

      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new Error("User with the provided ID not found");
      }

      ResponseHandler.sendSuccessResponse(res,"User deleted", StatusCodes.OK);
  
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.NOT_FOUND, error.message);
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
      const id = req.body.id;
     try{
      if (!id) {
        throw new Error("id not found");
      }
      
      let user = await this.userRepository.findOneBy({ userId: id });

      if (!user) {
        throw new Error("User not found");
      }

      user.email = req.body.email;
      user.role = req.body.roleId;

      const errors = await validate(user);
      if (errors.length > 0) {
         throw new Error (errors.map(err => Object.values(err.constraints || {})).join(", "));
      }

      user = await this.userRepository.save(user);

      ResponseHandler.sendSuccessResponse(res, user, StatusCodes.OK);

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };
}
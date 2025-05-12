import { Request, Response } from 'express';
import { AppDataSource } from '../data-source'; 
import { User } from '../entity/User';
import { Repository } from "typeorm";
import { ResponseHandler } from '../helper/ResponseHandler';
import { instanceToPlain } from "class-transformer";
import { StatusCodes } from 'http-status-codes';
import { validate } from "class-validator";
import { IEntityController} from './IEntityController';
import { AppError } from "../helper/AppError";

export class UserController implements IEntityController{
  public static readonly ERROR_NO_USER_ID_PROVIDED = "No ID provided";
  public static readonly ERROR_INVALID_USER_ID_FORMAT = "Invalid ID format";
  public static readonly ERROR_USER_NOT_FOUND = "User not found";
  public static readonly ERROR_USER_NOT_FOUND_WITH_ID = (id: number) => `User not found with ID: ${id}`;
  public static readonly ERROR_PASSWORD_IS_BLANK = "Password is blank";
  public static readonly ERROR_FAILED_TO_RETRIEVE_USERS = "Failed to retrieve users";
  public static readonly ERROR_FAILED_TO_RETRIEVE_USER = "Failed to retrieve user";
  public static readonly ERROR_USER_NOT_FOUND_FOR_DELETION = "User with the provided ID not found";
  public static readonly ERROR_EMAIL_REQUIRED = "Email is required";
  public static readonly ERROR_EMAIL_NOT_FOUND = (email: string) => `${email} not found`;
  public static readonly ERROR_RETRIEVING_USER = (error: string) => `Error retrieving user: ${error}`;
  public static readonly ERROR_UNABLE_TO_FIND_USER_EMAIL = (email: string) => `Unable to find user with the email: ${email}`;
  public static readonly ERROR_VALIDATION_FAILED = "Validation failed";

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
        ResponseHandler.sendSuccessResponse(res, [], StatusCodes.NO_CONTENT); 
      }

      ResponseHandler.sendSuccessResponse(res, users);

    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 
                                        StatusCodes.INTERNAL_SERVER_ERROR, 
                                      `${UserController.ERROR_FAILED_TO_RETRIEVE_USERS}: ${error.message}`);
    }
  };

  public getByEmail = async (req: Request, res: Response): Promise<void> => {
    const email = req.params.emailAddress;

    if (!email || email.trim().length === 0) {
      ResponseHandler.sendErrorResponse(res, 
                                        StatusCodes.BAD_REQUEST, 
                                        UserController.ERROR_EMAIL_REQUIRED);
      return;
    }

    try {
      const user = await this.userRepository.find({ where: { email: email },  
                                                    relations: ["role"]});
      if (user.length === 0) {
        ResponseHandler.sendErrorResponse(res, 
                                          StatusCodes.BAD_REQUEST, 
                                          `${email} not found`);
        return;
      }

      ResponseHandler.sendSuccessResponse(res, user);

    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 
                                        StatusCodes.BAD_REQUEST,  
                                        UserController.ERROR_UNABLE_TO_FIND_USER_EMAIL(email));
      }
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      ResponseHandler.sendErrorResponse(res, 
                                        StatusCodes.BAD_REQUEST, 
                                        UserController.ERROR_INVALID_USER_ID_FORMAT);
      return;
    }

    try {
      const user = await this.userRepository.findOne({ where: { userId: id },  
                                                      relations: ["role"] });
      if (!user) {
        ResponseHandler.sendErrorResponse(res, 
                                          StatusCodes.NO_CONTENT, 
                                          UserController.ERROR_USER_NOT_FOUND_WITH_ID(id));
        return;
      }

      ResponseHandler.sendSuccessResponse(res, user);
     
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, 
                                        StatusCodes.BAD_REQUEST, 
                                        UserController.ERROR_RETRIEVING_USER(error.message));
    }
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      let user = new User();
      user.firstName = req.body.firstName;
      user.surname = req.body.surname;
      user.email = req.body.email;
      user.password = req.body.password;
      user.roleId = req.body.roleId;

      const errors = await validate(user);
      if (errors.length > 0) { 
         throw new Error (errors.map(err => Object.values(err.constraints || {})).join(", "));
      }

      user = await this.userRepository.save(user); 
      ResponseHandler.sendSuccessResponse(res, 
                                          instanceToPlain(user), 
                                          StatusCodes.CREATED);

    } catch (error: any) { 
      ResponseHandler.sendErrorResponse(res, 
                                        StatusCodes.BAD_REQUEST, 
                                        error.message);
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    try {
      if (!id) {
        throw new Error("No ID provided");
      }

      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new Error("User with the provided ID not found");
      }

      ResponseHandler.sendSuccessResponse(res,
                                          "User deleted", 
                                          StatusCodes.OK);
  
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, 
                                        StatusCodes.NOT_FOUND, 
                                        error.message);
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
      const id = req.body.id;
     try{
      if (!id) {
        throw new Error(UserController.ERROR_NO_USER_ID_PROVIDED);
      }
      
      let user = await this.userRepository.findOneBy({ userId : id });

      if (!user) {
        throw new Error(UserController.ERROR_USER_NOT_FOUND);
      }

      user.email = req.body.email;
      user.roleId = req.body.roleId;

      const errors = await validate(user);
      if (errors.length > 0) { 
         throw new Error (errors.map(err => Object.values(err.constraints || {})).join(", "));
      }

      user = await this.userRepository.save(user);

      ResponseHandler.sendSuccessResponse(res, 
                                          user, 
                                          StatusCodes.OK);

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, 
                                        StatusCodes.BAD_REQUEST, 
                                        error.message);
    }
  };
}
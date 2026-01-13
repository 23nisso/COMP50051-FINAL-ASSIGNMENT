import { Response } from "express";
import { ResponseHandler } from "./ResponseHandler";
import { AppError } from "../AppError";
import { Logger } from "../Logger";

export class ErrorHandler {
    static handle(err: AppError, res: Response): void {
        Logger.error(err.message);
        ResponseHandler.sendErrorResponse(res, err.statusCode, err.message);
    }
}
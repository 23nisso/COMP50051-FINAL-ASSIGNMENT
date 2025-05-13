import { Response } from "express";
import { ResponseHandler } from "../handlers/ResponseHandler";
import { AppError } from "../../helpers/AppError";
import { Logger } from "../../helpers/Logger";

export class ErrorHandler {
    static handle(err: AppError, res: Response): void {
        Logger.error(err.message);
        ResponseHandler.sendErrorResponse(res, err.statusCode, err.message);
    }
}
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../Logger';

export class ResponseHandler {
    public static sendErrorResponse(res: Response, statusCode: number, message?: string) {
        res.status(statusCode || 500).json({
        error: {
            message: message || "Internal Server Error, please try again later",
            status: statusCode || 500,
            timestamp: new Date().toISOString()
        }
    });
}
    public static sendSuccessResponse(
        res: Response, 
        data: any = {},
        statusCode: number = StatusCodes.OK 

    ): Response {
        const successResponse = {
            data: data,

        };
        return res.status(statusCode).send(successResponse);
    }
}
import { RequestHandler, Request, Response, NextFunction } from "express";
import { IAuthenticatedJWTRequest } from "../types/IAuthenticatedJWTRequest";
import { Logger } from "../helpers/Logger";
import { ResponseHandler } from "../helpers/handlers/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

export class MiddlewareFactory {
  static loginLimiter(): RequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: "Too many requests - try again later",
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  static jwtRateLimiter(userEmail: string): RequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: "Too many requests - try again later",
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: () => userEmail,
    });
  }

  static jwtRateLimitMiddleware(route: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const email = req.signedInUser?.email;

      if (email) {
        Logger.info(`${route} rate limited for ${email} @ ${req.ip}`);
        MiddlewareFactory.jwtRateLimiter(email)(req, res, next);
      } else {
        Logger.error("JWT missing email claim.");
        ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Missing email in token.");
      }
    };
  }

  static logRouteAccess(route: string): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
      Logger.info(`Route accessed: [${route}] by ${req.ip}`);
      next();
    };
  }

  static authenticateToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      Logger.error("Auth header not found");
      ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Not authorised - Token not found");
      return;
    }

    const tokenReceived = authHeader?.split(" ")[1];
if (!tokenReceived) {
  Logger.error("Bearer token missing from header.");
  return ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Token format invalid");
}
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      Logger.error("JWT_SECRET is not defined");
      throw new Error("Token secret not found/defined");
    }

    jwt.verify(tokenReceived, jwtSecret, (err, payload) => {
      if (err || !payload || typeof payload !== "object") {
        Logger.error("Invalid JWT token");
        return ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Not authorised - Token is invalid");
      }

      try {
        const { email, roleId: role, userId } = payload;
          if (!email || !role || !userId) {
          throw new Error();
        }

        req.signedInUser = { email, roleId: role, userId };
        next();
      } catch {
        Logger.error("JWT payload malformed");
        ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Not authorised - Token is invalid");
      }
    });
  }

  static authoriseRoles(allowedRoles: (string | number)[]): RequestHandler {
  return (req: IAuthenticatedJWTRequest, res: Response, next: NextFunction) => {
    const role = req.signedInUser?.roleId;
    if (!role || !allowedRoles.includes(role)) {
      Logger.warn(`Access denied for role: ${role}`);
      return ResponseHandler.sendErrorResponse(res, StatusCodes.FORBIDDEN, "Access denied: insufficient permissions.");
    }
    next();
  };
}}
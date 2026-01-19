import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IAuthenticatedJWTRequest } from "../controller/interfaces/IAuthenticatedJWTRequest";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Missing or invalid authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as any;

    (req as IAuthenticatedJWTRequest).signedInUser = {
      userId: decoded.userId,
      roleId: decoded.roleId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

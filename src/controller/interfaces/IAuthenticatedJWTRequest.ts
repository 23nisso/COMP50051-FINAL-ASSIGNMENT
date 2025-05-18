import { Request } from "express";

export interface IAuthenticatedJWTRequest extends Request {
  signedInUser?: {
    email: string;
    roleId: string;
    userId: number;
  };
}
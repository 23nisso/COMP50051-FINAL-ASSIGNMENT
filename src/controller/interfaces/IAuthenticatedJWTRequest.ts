import { Request } from "express";

export interface ISignedInUser {
  userId: number;
  roleId: number;
  email: string;
}

export interface IAuthenticatedJWTRequest extends Request {
  body: any;
  params: {
    id?: string;
    [key: string]: string | undefined;
  };
  signedInUser?: ISignedInUser;
}
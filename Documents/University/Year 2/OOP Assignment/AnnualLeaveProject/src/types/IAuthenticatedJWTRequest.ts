import express from "express";
import { Role } from "../entity/Role";
import { Request } from "express";

export interface IAuthenticatedJWTRequest extends Request {
    signedInUser?: {
        email: string;
        roleId: string;
    };
}
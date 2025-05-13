import express from "express";
import { Role } from "../entities/Role";
import { Request } from "express";

export interface IAuthenticatedJWTRequest extends Request {
    signedInUser?: {
        email: string;
        roleId: string;
    };
}
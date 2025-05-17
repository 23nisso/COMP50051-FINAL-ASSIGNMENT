import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "./entities/User";
import { Role } from "./entities/Role";
import { LeaveRequest } from "./entities/LeaveRequest";
import { UserManagement } from "./entities/UserManagement";
import { LeaveType } from "./entities/LeaveType";
import { Department } from "./entities/Department";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.NODE_ENV !== "development",
    logging: false,
    entities: [Department, LeaveRequest, LeaveType, Role, User, UserManagement]
});
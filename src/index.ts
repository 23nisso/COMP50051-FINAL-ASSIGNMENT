import { Server } from "./Server";
import express, { Router } from "express";
import { DataSource } from "typeorm";
import { AppDataSource } from "./data-source"; 
import { LoginRouter } from "./routes/LoginRouter";
import { RoleRouter } from "./routes/RoleRouter";
import { UserRouter } from "./routes/UserRouter";
import { RoleController } from "./controller/controllers/RoleController";
import { UserController } from "./controller/controllers/UserController";
import { LoginController } from "./controller/controllers/LoginController";
import { LeaveRequestRouter } from "./routes/LeaveRequestRouter";
import { LeaveRequestController } from "./controller/controllers/LeaveRequestController";
import { LeaveTypeRouter } from "./routes/LeaveTypeRouter";
import { LeaveTypeController } from "./controller/controllers/LeaveTypeController";
import { UserManagementRouter } from "./routes/UserManagementRouter";
import { UserManagementController } from "./controller/controllers/UserManagementController";

const DEFAULT_PORT = 7063
const port = process.env.SERVER_PORT || DEFAULT_PORT;
if (!process.env.SERVER_PORT) {
    console.log("PORT environment variable is not set, defaulting to " + DEFAULT_PORT);
}

const appDataSource: DataSource = AppDataSource;

const app = express();

const routers = [
    new LoginRouter(Router(), new LoginController()),
    new LeaveRequestRouter(Router(), new LeaveRequestController()),
    new LeaveTypeRouter(Router(), new LeaveTypeController()),
    new RoleRouter(Router(), new RoleController()),
    new UserRouter(Router(), new UserController())
];

const server = new Server(port, routers, AppDataSource);
server.start();
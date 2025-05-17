import { Server } from "./Server";
import { DataSource } from "typeorm";
import { AppDataSource } from "./data-source";
import { LoginRouter } from "./routers/LoginRouter";
import { RoleRouter } from "./routers/RoleRouter";
import UserRouter from "./routers/UserRouter";
import LeaveRequestRouter from "./routers/LeaveRequestRouter";
import { LeaveTypeRouter } from "./routers/LeaveTypeRouter";
import { UserManagementRouter } from "./routers/UserManagementRouter";
import { RoleController } from "./controller/controllers/RoleController";
import { UserController } from "./controller/controllers/UserController";
import { LoginController } from "./controller/controllers/LoginController";
import { LeaveRequestController } from "./controller/controllers/LeaveRequestController";
import { LeaveTypeController } from "./controller/controllers/LeaveTypeController";
import { UserManagementController } from "./controller/controllers/UserManagementController";

const DEFAULT_PORT = 7063;
const port = process.env.SERVER_PORT || DEFAULT_PORT;

if (!process.env.SERVER_PORT) {
    console.log("PORT environment variable is not set, defaulting to " + DEFAULT_PORT);
}

const appDataSource: DataSource = AppDataSource;

const routers = [
  {
    basePath: "/api/login",
    routeName: "Login",
    authenticate: false,
    getRouter: () => LoginRouter
  },
  {
    basePath: "/api/users",
    routeName: "User",
    authenticate: true,
    getRouter: () => UserRouter
  },
  {
    basePath: "/api/roles",
    routeName: "Role",
    authenticate: true,
    getRouter: () => RoleRouter
  },
  {
    basePath: "/api/leave-requests",
    routeName: "LeaveRequest",
    authenticate: true,
    getRouter: () => LeaveRequestRouter
  },
  {
    basePath: "/api/leave-types",
    routeName: "LeaveType",
    authenticate: true,
    getRouter: () => LeaveTypeRouter
  },
  {
    basePath: "/api/user-management",
    routeName: "UserManagement",
    authenticate: true,
    getRouter: () => UserManagementRouter
  }
]

const server = new Server(port, routers, appDataSource);
server.start();
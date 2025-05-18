import { Server } from "./Server";
import { Router } from "express";
import { DataSource } from "typeorm";
import { AppDataSource } from "./data-source";
import { LoginRouter } from "./routers/LoginRouter";
import { RoleRouter } from "./routers/RoleRouter";
import { UserRouter } from "./routers/UserRouter";
import { LeaveRequestRouter } from "./routers/LeaveRequestRouter";
import { LeaveTypeRouter } from "./routers/LeaveTypeRouter";
import { UserManagementRouter } from "./routers/UserManagementRouter";
import { LoginController } from "./controller/controllers/LoginController";
import { LeaveTypeController } from "./controller/controllers/LeaveTypeController";
import { UserManagementController } from "./controller/controllers/UserManagementController";
import { UserController } from "./controller/controllers/UserController";
import { LeaveRequestController } from "./controller/controllers/LeaveRequestController";
import { DepartmentRouter } from "./routers/DepartmentRouter";
import { DepartmentController } from "./controller/controllers/DepartmentController";

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
    getRouter: () => new LoginRouter(Router(), new LoginController()).getRouter()
  },
  {
  basePath: "/api/users",
  routeName: "User",
  authenticate: true,
  getRouter: () => new UserRouter(Router(), new UserController()).getRouter()
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
  getRouter: () => new LeaveRequestRouter(Router(), new LeaveRequestController()).getRouter()
},
  {
    basePath: "/api/leave-types",
    routeName: "LeaveType",
    authenticate: true,
    getRouter: () => new LeaveTypeRouter(Router(), new LeaveTypeController()).getRouter()
  },
  {
    basePath: "/api/user-management",
    routeName: "UserManagement",
    authenticate: true,
      getRouter: () => new UserManagementRouter(Router(), new UserManagementController()).getRouter()
  },
  {
  basePath: "/api/departments",
  routeName: "Department",
  authenticate: true,
  getRouter: () => new DepartmentRouter(Router(), new DepartmentController()).getRouter()
}
]
const server = new Server(port, routers, appDataSource);
server.start();

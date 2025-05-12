import { Server } from "./Server";
import { Router } from "express";
import { DataSource } from "typeorm";
import { AppDataSource } from "./data-source"; 
import { LoginRouter } from "./routes/LoginRouter";
import { RoleRouter } from "./routes/RoleRouter";
import { UserRouter } from "./routes/UserRouter";
import { RoleController } from "./controllers/RoleController";
import { UserController } from "./controllers/UserController";
import { LoginController } from "./controllers/LoginController";

const DEFAULT_PORT = 7063
const port = process.env.SERVER_PORT || DEFAULT_PORT;
if (!process.env.SERVER_PORT) {
    console.log("PORT environment variable is not set, defaulting to " + DEFAULT_PORT);
}

const appDataSource: DataSource = AppDataSource;

const routers = [
    new LoginRouter(Router(), new LoginController()),
    new RoleRouter(Router(), new RoleController()),
    new UserRouter(Router(), new UserController())
];

const server = new Server(port, routers, AppDataSource);
server.start();
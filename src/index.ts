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

const DEFAULT_PORT = 7063
const port = process.env.SERVER_PORT || DEFAULT_PORT;
if (!process.env.SERVER_PORT) {
    console.log("PORT environment variable is not set, defaulting to " + DEFAULT_PORT);
}

const appDataSource: DataSource = AppDataSource;

const app = express();

const routers = [
    app.use("/api", LoginRouter(new LoginController())),
    new RoleRouter(Router(), new RoleController()),
    new UserRouter(Router(), new UserController())
];

const server = new Server(port, routers, AppDataSource);
server.start();
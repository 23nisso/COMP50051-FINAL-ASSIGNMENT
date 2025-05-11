import { Server } from "./Server";
import { Router } from "express";
import { AppDataSource } from "./data-source"; 
import { RoleRouter } from "./routes/RoleRouter";
import { RoleController } from "./controllers/RoleController";

const DEFAULT_PORT = 7063;
const port = process.env.SERVER_PORT || DEFAULT_PORT;

if (!process.env.SERVER_PORT) {
  console.log("PORT environment variable is not set, defaulting to " + DEFAULT_PORT);
}

const appDataSource = AppDataSource;

const roleRouter = new RoleRouter(Router(), new RoleController());
const server = new Server(port, roleRouter, appDataSource);

server.start();
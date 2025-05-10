import { Server } from "./Server"; // Importing the Server class as that Server.ts file contains all the Express app setup
import { Router } from "express";
import { MyRouter } from "./routes/MyRouter"; // Importing the MyRouter class as that file contains all the routes setup

const myRouter = new MyRouter(Router()); // Creating an instance of MyRouter and passing it with an Express MyRouter object
const server = new Server(myRouter, 7063); // Creating an instance of the Server class with the router and port number
server.start(); // Express calling the start method to start the server
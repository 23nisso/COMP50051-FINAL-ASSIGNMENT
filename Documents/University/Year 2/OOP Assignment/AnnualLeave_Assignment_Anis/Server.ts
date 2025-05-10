import express, { Application, Request, Response } from "express"; // Imports Express and TypeScript types, like HTTP request and response objects
import { MyRouter } from "./routes/MyRouter"; // Imports the MyRouter class from the routes folder
import { StatusCodes } from "http-status-codes"; // Imports HTTP status codes from the http-status-codes package

export class Server { // Defines the Server class
	private readonly app: Application; // Defines the app property of type Application from Express

	constructor(private readonly myRouter: MyRouter, // Takes an instance of MyRouter as a parameter
				private readonly port: number) { // Takes a port number as a parameter
	this.app = express(); // Creates the Express application instance and stories it in this.app

	this.initialiseMiddlewares(); // Sets up the middlewares for the application

	this.initialiseRoutes(); // Sets up the routes for the application

	this.initialiseErrorHandling(); //Sets up the error handling for the application (This is last)
	}

	private initialiseMiddlewares() { // Sets up the middlewares to parse (interpret/read)
	this.app.use(express.json()); // incoming requests as JSONs
	}

	private initialiseErrorHandling() { // Sets up the error handling for when any unmatched routes are requested
	this.app.get("*", (req: Request, res: Response) => { // This catches any GET request that doesn't match any of the defined routes
		const requestedUrl =`${req.protocol}://${req.get('host')}${req.originalUrl}`; // Gets the requested URL
		res.status(StatusCodes.NOT_FOUND).send("Route " + requestedUrl + " not found"); // Sends a 404 Not Found response with the requested URL
	});
}

	private initialiseRoutes(): void { // Mounts any custom router at the /api endpoint
	this.app.use("/api", this.myRouter.getRouter()); // Any route inside MyRouter will be prefixed with /api
}

	public start(): void { // Public method start just starts the server
	this.app.listen(this.port, () => { // Listens on the specified port
		console.log(`Server listening on port ${this.port}`); // Logs a message to the console when the server starts
		});
	}
}
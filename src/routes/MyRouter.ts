import { Router } from "express"; // Imports the Router class from Express, which is used to create route handlers
import { Request, Response } from 'express'; // Imports the Request and Response types from Express for TypeScript type checking
import { StatusCodes } from "http-status-codes"; // Imports HTTP status codes from the http-status-codes package, which provides a set of constants for HTTP status codes

export class MyRouter { /// Defines and exports a class named MyRouter
    constructor(private router: Router) { // Constructor takes a Router instance and assigns it a private property router
        this.router = Router(); // Initializes the router property with a new Router instance
        this.addRoutes(); // Calls the addRoutes method to set up the routes when an instance of MyRouter is created
    }

    public getRouter(): Router { // Public method returns the router instance
        return this.router; // This is used by the Index file to mount the router at a specific endpoint
    }

    private addRoutes() { // Private method to define the routes for this router
        this.router.get('/', (req: Request, res: Response) => { // Defines a GET route for the root path
        res.status(StatusCodes.OK).send("reached index"); // Sends a 200 OK response with the message "reached index"
    });

    this.router.get('/other', (req: Request, res: Response) => { // Defines a GET route for the /other path
        res.status(StatusCodes.OK).send("reached other"); // Sends a 200 OK response with the message "reached other"
        });
    }
}
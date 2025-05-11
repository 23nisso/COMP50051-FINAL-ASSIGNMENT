import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Repository } from "typeorm";
import { Role } from "./entity/Role";
import { StatusCodes } from 'http-status-codes';

const app = express();
const port = process.env.SERVER_PORT;
const appDataSource = AppDataSource;
let roleRepository: Repository<Role> = AppDataSource.getRepository(Role);

try {
    appDataSource.initialize();
    console.log("Data Source initialised");
} catch (error) {
    console.log("Error during initialisation:", error);
    throw error;
}

app.get("/api/roles",
        async (req: Request, res: Response): Promise<void> => {
    try{
        const roles = await roleRepository.find();
        
    if (roles.length === 0) {
res.status(StatusCodes.NO_CONTENT);
return;
}
res.send(roles);
} catch (error) {
res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Failed to retrieve roles");
}
});
app.get("/api/roles/:id",
    async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
    res.status(StatusCodes.BAD_REQUEST).send("Invalid ID format");
    return;
    }
    try{
    const role = await roleRepository.findOne({ where: { id: id }});
    if (!role) {
    res.status(StatusCodes.NOT_FOUND).send(`Role not found with ID: ${id}`);
    return;
    }
    res.status(StatusCodes.OK).send(role);
    } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Failed to retrieve role");
    }
    });
    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    });
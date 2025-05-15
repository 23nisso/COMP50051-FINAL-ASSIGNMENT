import { Router } from "express"; 
import { IEntityController } from "../controller/interfaces/IEntityController";
import { IGetByEmail } from "../controller/interfaces/IGetByEmail";

export class UserRouter {
  public routeName = "users";
  public basePath = "/api/users";
  public authenticate = true;

  constructor(private router: Router, 
            private userController: IGetByEmail) {
    this.addRoutes(); 
  }

  public getRouter(): Router {
    return this.router;
  } 

  private addRoutes() {
    this.router.delete('/:id', this.userController.delete);  
    this.router.get('/', this.userController.getAll);  
    this.router.get('/email/:emailAddress', this.userController.getByEmail); 
    this.router.get('/:id', this.userController.getById); 
    this.router.post('/', this.userController.create);  
    this.router.patch('/', this.userController.update);
  }
}


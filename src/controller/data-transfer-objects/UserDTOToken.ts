import { Role } from "../../entities/Role"; 

export class UserDTOToken{    
  constructor(
    private email: string,
    private roleId: Role
  ) {}
}
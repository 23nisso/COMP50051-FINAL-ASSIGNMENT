import { User } from "../../entities/User";
import { Role } from "../../entities/Role";
import * as classTransformer from "class-transformer";
import { instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { QueryFailedError, Repository } from 'typeorm';
import { mock } from "jest-mock-extended";

describe("User Entity tests", () => {
    let mockUserRepository: jest.Mocked<Repository<User>>; 
    let user: User;
    let role: Role;

    beforeEach(() => {
        mockUserRepository = mock<Repository<User>>();

        role = new Role();
        role.roleId = 1;
        role.name = "admin";

        user = new User();
        user.userId = 1;
        user.email = "test@email.com"; 
        user.password = 'a'.repeat(10);
        user.role = role;
    });

it("A password must be a string", async () => {
    user.password = 1234 as any; 

    const errors = await validate(user);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty("isString");
    });

it("A password less than 10 characters is considered invalid", async () => {
    user.password = 'a'.repeat(9);

    const errors = await validate(user);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("minLength");
    });

it("A poorly formed email is considered invalid", async () => {
    user.email = "not a valid email address";

    const errors = await validate(user);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty("isEmail");
    });

it("A user with no role is considered invalid", async () => {
    user.role = null;

    const errors = await validate(user);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty("isNotEmpty");
    });

it("A user with valid details will be accepted", async () => {
    const errors = await validate(user);
    
    expect(errors.length).toBe(0);
    });

it("A user with valid details will not return their password after submitting valid details", () => {      
    jest.spyOn(classTransformer, "instanceToPlain").mockReturnValue({
        id: user.userId,
        email: user.email,
        role: { id: user.role.roleId, 
                name: user.role.name },
    } as any);
            
    const plainUser = instanceToPlain(user);
        
    expect(plainUser).toHaveProperty("id", user.userId);
    expect(plainUser).toHaveProperty("email", user.email);
    expect(plainUser).toHaveProperty("role", { id: role.roleId, name: role.name });
    expect(plainUser).not.toHaveProperty("password");
    });

it("Users will not include a password from a get request", async () => {
    const user = new User();
    mockUserRepository.findOne.mockResolvedValue({
        id: user.userId,
        email: user.email,
        role: { id: role.roleId, name: role.name },
    } as unknown as User);
    
    const retrievedUser = await mockUserRepository.findOne({ where: { userId: user.userId } });

    expect(retrievedUser).toBeDefined();
    expect(retrievedUser).toHaveProperty("id", user.userId);
    expect(retrievedUser).toHaveProperty("email", user.email);
    expect(retrievedUser).toHaveProperty("role", { id: role.roleId, name: role.name });
    expect(retrievedUser).not.toHaveProperty("password");
});

it("A new user with a duplicate email address cannot be inserted/saved", async () => { 
    mockUserRepository.save.mockImplementationOnce(
        (user: User) => Promise.resolve(user)
    );

    mockUserRepository.save.mockRejectedValue(
        new QueryFailedError(
            "INSERT INTO user", 
            [], 
            new Error(`#1062 - Duplicate entry '${user.email}' for key 'email'`)
        )
    );
    await expect(mockUserRepository.save(user)).resolves.toEqual(user);
    
    const userWithDuplicateEmailAddress = new User();
    userWithDuplicateEmailAddress.email = user.email; 
    userWithDuplicateEmailAddress.password = 'a'.repeat(10);
    userWithDuplicateEmailAddress.role = role;

    await expect(mockUserRepository.save(userWithDuplicateEmailAddress)).rejects.toThrow(QueryFailedError);
    });
});
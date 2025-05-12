import "dotenv/config"; 
import { PasswordHandler } from "./PasswordHandler"; 

const TEST_PASSWORD = "AnisLayaida2004";

const { hashedPassword, salt } = PasswordHandler.hashPassword(TEST_PASSWORD);
console.log("Hashed Password:", hashedPassword);
console.log("Salt:", salt);

console.log("Correct Password Verified:", PasswordHandler.verifyPassword(TEST_PASSWORD, hashedPassword, salt));

console.log("Wrong Password Verified:", PasswordHandler.verifyPassword("Some other password", hashedPassword, salt));
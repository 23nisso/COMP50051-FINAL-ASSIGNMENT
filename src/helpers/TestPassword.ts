import "dotenv/config"; 
import { PasswordHandler } from "./handlers/PasswordHandler"; 

const TEST_PASSWORD = "AnisLayaida2004";

const { hashedPassword, salt } = PasswordHandler.hashPassword(TEST_PASSWORD);

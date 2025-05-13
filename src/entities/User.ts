import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from "typeorm"
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from "./Role";
import { Exclude } from 'class-transformer';
import { PasswordHandler } from '../helpers/handlers/PasswordHandler';

@Entity({ name: "user" })
export class User {

  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  firstName: string;

  @Column()
  surname: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @Column({ select: false })
  @Exclude()
  @IsString()
  @MinLength(10, { message: 'Password must be at least 10 characters long' })
  password: string;

  @Column({ nullable: true })
  salt: string;

  @Column({ default: 25 })
  annualLeaveBalance: number;

  @ManyToOne(() => Role, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "roleId" })
  role: Role;

  @BeforeInsert()
  hashPassword() {
    if (!this.password) {
      throw new Error("Password must be provided before inserting a user.");
      }

      const { hashedPassword, salt } = PasswordHandler.hashPassword(this.password);
      this.password = hashedPassword;
      this.salt = salt;
    }
}

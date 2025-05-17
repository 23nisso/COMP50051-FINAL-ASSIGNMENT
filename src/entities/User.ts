import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, BeforeInsert, BeforeUpdate} from "typeorm";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { Role } from "./Role";
import { Department } from "./Department";
import { LeaveRequest } from "./LeaveRequest";
import { PasswordHandler } from "../helpers/handlers/PasswordHandler";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "roleId" })
  role: Role;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: "departmentId" })
  department: Department;

  @Column()
  firstName: string;

  @Column()
  surname: string;

  @Column()
  officeLocation: string;

  @Column()
  officeName: string;

  @IsNotEmpty()
  @IsEmail()
  @Column()
  email: string;

  @IsNotEmpty()
  @MinLength(10, { message: "Password must be at least 10 characters long" })
  @Column()
  password: string;

  @Column()
  salt: string;

  @Column({ default: 25 })
  annualLeaveBalance: number;

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.user)
  leaveRequest: LeaveRequest[];

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword(): void {
    if (!this.password) return;

    const { hashedPassword, salt } = PasswordHandler.hashPassword(this.password);
    this.password = hashedPassword;
    this.salt = salt;
  }
}



import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, OneToMany} from "typeorm"
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from "./Role";
import { Department } from "./Department";
import { Exclude } from 'class-transformer';
import { PasswordHandler } from '../helpers/handlers/PasswordHandler';
import { LeaveRequest } from "./LeaveRequest";

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

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @Column({ default: 25 })
  annualLeaveBalance: number;

  @OneToMany(() => LeaveRequest, (request) => request.user)
  leaveRequests: LeaveRequest[];
}

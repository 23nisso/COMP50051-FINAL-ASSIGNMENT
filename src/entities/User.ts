import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import bcrypt from "bcrypt";

import { Role } from "./Role";
import { Department } from "./Department";
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

  @IsNotEmpty()
  @IsEmail()
  @Column()
  email: string;

  @IsNotEmpty()
  @MinLength(10, { message: "Password must be at least 10 characters long" })
  @Column({ select: false })
  password: string;

  @Column({ default: 25 })
  annualLeaveBalance: number;

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.user)
  leaveRequests: LeaveRequest[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (!this.password || this.password.startsWith("$2b$")) return;

    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
}

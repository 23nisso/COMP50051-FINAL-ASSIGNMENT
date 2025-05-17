import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "./User";

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  departmentId: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.department)
  users: User[];
}



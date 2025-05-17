import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LeaveRequest } from './LeaveRequest';

@Entity({ name: "leave_type" })
export class LeaveType {

  @PrimaryGeneratedColumn()
  leaveTypeId: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  leaveType: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: 25 })
  initialBalance: number;

  @Column({ default: 5 })
  maxRollOverDays: number;

  @OneToMany(() => LeaveRequest, (request) => request.leaveType)
  leaveRequests: LeaveRequest[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { LeaveType } from './LeaveType';

@Entity({ name: "leave_request" })
export class LeaveRequest {

  @PrimaryGeneratedColumn()
  leaveRequestId: number;

  @ManyToOne(() => User, user => user)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => LeaveType)
  @JoinColumn({ name: 'leaveType' })
  leaveType: LeaveType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
    })
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

  @Column({ type: 'text', nullable: true })
  reason: string | null;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { LeaveType } from './LeaveType';

@Entity({ name: "leave_request" })
export class LeaveRequest {

  @PrimaryGeneratedColumn()
  leaveRequestId: number;

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.leaveRequests, { onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({ name: "leaveTypeId" })
  leaveType: { leaveTypeId: number };

  @ManyToOne(() => User, (user) => user.leaveRequest, { onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({ name: "userId" })
  user: { userId: number };

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

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: "leave_type" })
export class LeaveType {

  @PrimaryGeneratedColumn()
  leaveTypeId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: 25 })
  initialBalance: number;

  @Column({ default: 5 })
  maxRollOverDays: number;
}

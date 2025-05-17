import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from './User';

@Entity()
export class UserManagement {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  userId: number;

  @ManyToOne(() => User)
  managerId: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;
}

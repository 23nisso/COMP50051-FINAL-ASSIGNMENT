import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    userId: number

    @Column()
    firstName: string

    @Column()
    surname: string

    @Column()
    email: string

    @Column()
    salt: string

    @Column()
    role: string

    @Column()
    annualLeaveBalance: number
}

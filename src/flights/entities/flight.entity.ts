import { FlightClass } from "src/common/enums/flight-class.enum";
import { FlightStatus } from "src/common/enums/flight-status.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FlightClassCatogories } from "./flight-class.entity";

@Entity()
export class Flight {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', nullable: false })
    airLineName: string

    @Column({ type: 'int2', nullable: true })
    flightNumber: number

    @Column({ type: 'timestamp with time zone', nullable: false })
    departureTime: Date

    @Column({ type : 'timestamp with time zone', nullable : true, default : null})
    estimatedTimeToReach: Date

    @Column({ type: 'int2', nullable: false })
    totalSeats: number

    @Column({ type: 'varchar', nullable: false })
    destination: string

    @Column({ type: 'varchar', nullable: false })
    origin: string
    
    @Column({ type: 'enum', enum: FlightStatus, default: FlightStatus.ONTIME })
    status: FlightStatus

    @OneToMany(() => FlightClassCatogories, flightClassCatogories => flightClassCatogories.flight)
    flightClassCatogories: FlightClassCatogories[]

    @CreateDateColumn({ type: 'timestamp with time zone', nullable: false })
    createdAt: Date

    @CreateDateColumn({ type: 'timestamp with time zone', nullable: false })
    updatedAt: Date
}

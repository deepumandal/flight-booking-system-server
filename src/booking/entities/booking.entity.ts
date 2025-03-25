import { FlightClass } from "src/common/enums/flight-class.enum";
import { Flight } from "src/flights/entities/flight.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED'
}

@Entity()
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', nullable: true })
    seatNumber: string

    @Column({ type: 'int2', nullable: false })
    passengers: number

    @Column({ type: 'enum', enum: FlightClass, nullable: false })
    flightClass: FlightClass

    @Column({ type: 'uuid', nullable: false })
    userId: string

    @Column({ type: 'uuid', nullable: false })
    flightId: string
    
    @Column({ type : 'boolean', default : false})
    isRoundTrip : boolean

    @Column({ type : 'timestamp with time zone', nullable : true, default : null})
    returnRoundTripTime : Date

    @ManyToOne(()=> User)
    @JoinColumn({
        name : 'userId'
    })
    user : User

    @Column({ type : 'enum', enum : BookingStatus, default : BookingStatus.PENDING})
    status : BookingStatus

    @ManyToOne(()=> Flight)
    @JoinColumn({
        name : 'flightId'
    })
    flight : Flight

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt : Date

    @UpdateDateColumn({ type : 'timestamp with time zone'})
    updatedAt : Date
}

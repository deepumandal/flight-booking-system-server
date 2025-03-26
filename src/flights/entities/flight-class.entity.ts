import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Flight } from "./flight.entity";
import { FlightClass } from "@/common/enums/flight-class.enum";

@Entity()
export class FlightClassCategories {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: FlightClass, default: FlightClass.ECONOMY })
  flightClass: FlightClass;

  @Column({ type: "int2", nullable: false })
  price: number;

  @Column({ type: "int2", nullable: false })
  seats: number;

  @Column({ type: "int2", nullable: false })
  remainingSeats: number;

  @Column({ type: "varchar", nullable: false })
  flightId: string;

  @ManyToOne(() => Flight)
  @JoinColumn({
    name: "flightId",
  })
  flight: Flight;
}

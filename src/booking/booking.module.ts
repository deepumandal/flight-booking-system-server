import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FlightClassCategories } from "src/flights/entities/flight-class.entity";
import { Flight } from "src/flights/entities/flight.entity";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { Booking } from "./entities/booking.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Flight, FlightClassCategories, Booking])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}

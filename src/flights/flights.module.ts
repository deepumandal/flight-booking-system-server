import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FlightClassCategories } from "./entities/flight-class.entity";
import { Flight } from "./entities/flight.entity";
import { FlightsController } from "./flights.controller";
import { FlightsService } from "./flights.service";

@Module({
  imports: [TypeOrmModule.forFeature([Flight, FlightClassCategories])],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}

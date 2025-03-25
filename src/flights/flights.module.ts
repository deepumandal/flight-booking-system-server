import { Module } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { FlightClassCatogories } from './entities/flight-class.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Flight, FlightClassCatogories])],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}

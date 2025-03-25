import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from 'src/flights/entities/flight.entity';
import { FlightClassCatogories } from 'src/flights/entities/flight-class.entity';
import { Booking } from './entities/booking.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Flight, FlightClassCatogories, Booking])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}

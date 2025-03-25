import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiTags } from '@nestjs/swagger';
import { VerifyPayment } from './dto/verify-payment.dto';

@Controller('booking')
@ApiTags('Booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Post('payment')
  verifyPayment(@Body() payload : VerifyPayment) {
    return this.bookingService.verifyPayment(payload)
  }

  @Get('user-bookings/:id')
  findUserBookings(@Param('id') id: string) {
    return this.bookingService.userBookings(id)
  }

  @Get('id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(id, updateBookingDto);
  }
}

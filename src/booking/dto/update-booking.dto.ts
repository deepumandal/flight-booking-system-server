import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';
import { IsEnum } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingDto {
    @ApiProperty({
        description : 'Booking Status',
        enum : BookingStatus
    })
    @IsEnum(BookingStatus)
    status : BookingStatus
}

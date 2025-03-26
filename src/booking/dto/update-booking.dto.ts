import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { CreateBookingDto } from "./create-booking.dto";
import { BookingStatus } from "../entities/booking.entity";

export class UpdateBookingDto {
  @ApiProperty({
    description: "Booking Status",
    enum: BookingStatus,
  })
  @IsEnum(BookingStatus)
  status: BookingStatus;
}

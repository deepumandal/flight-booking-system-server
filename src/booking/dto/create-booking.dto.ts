import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsNotEmpty, IsEnum } from "class-validator";
import { FlightClass } from "src/common/enums/flight-class.enum";

export class CreateBookingDto {
  @ApiProperty({
    description: "userId field",
    example: "example string",
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: "flightId field",
    example: "example string",
  })
  @IsNotEmpty()
  @IsString()
  flightId: string;

  @ApiProperty({
    description: "number of passengers",
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  passengers: number;

  @ApiProperty({
    description: "flight class",
    example: "ECONOMY",
  })
  @IsNotEmpty()
  @IsEnum(FlightClass)
  flightClass: FlightClass;
}

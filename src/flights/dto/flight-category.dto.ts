import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, Min } from "class-validator";
import { FlightClass } from "@/common/enums/flight-class.enum";

export class FlightClassCategoryDto {
  @ApiProperty({ enum: FlightClass })
  @IsEnum(FlightClass)
  flightClass: FlightClass;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  seats: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(100)
  price: number;
}

import { Type } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  IsDateString,
} from "class-validator";
import { FlightStatus } from "src/common/enums/flight-status.enum";
import { FlightClassCategoryDto } from "./flight-category.dto";

export class CreateFlightDto {
  @IsString()
  @IsNotEmpty()
  airLineName: string;

  @IsNumber()
  flightNumber: number;

  @IsDateString()
  departureTime: Date;

  @IsNumber()
  @Min(1)
  estimatedTimeToReach: number;

  @IsNumber()
  @Min(1)
  totalSeats: number;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsEnum(FlightStatus)
  status: FlightStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightClassCategoryDto)
  flightClassCategories: FlightClassCategoryDto[];
}

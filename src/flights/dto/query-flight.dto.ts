import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class QueryFlightDto {
  @ApiPropertyOptional({ example: "Air India" })
  @IsOptional()
  @IsString()
  airLineName?: string;

  @ApiPropertyOptional({ example: "Mumbai" })
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ example: "New Delhi" })
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ example: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value === "true" ? true : false))
  isRoundTrip?: boolean;

  @ApiPropertyOptional({
    example: "2025-05-10",
    description: "Format: YYYY-MM-DD",
  })
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: "2025-05-14",
    description: "Format: YYYY-MM-DD",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

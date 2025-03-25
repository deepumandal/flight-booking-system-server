import {
    IsString,
    IsNumber,
    IsBoolean,
    IsDate,
    IsOptional,
    IsNotEmpty,
    IsUUID,
    IsArray
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FlightStatus } from 'src/common/enums/flight-status.enum';
import { FlightClass } from 'src/common/enums/flight-class.enum';

export class CreateFlightDto {
    @ApiProperty({
        description: 'flightNumber field',
        example: 0
    })
    @IsNotEmpty()
    @IsNumber()
    flightNumber: number;

    @ApiProperty({
        description : 'airLineName field',
        example : 'example string'
    })
    @IsNotEmpty()
    @IsString()
    airLineName : string

    @ApiProperty({
        description: 'totalSeats field',
        example: 0
    })
    @IsNotEmpty()
    @IsNumber()
    totalSeats: number;

    @ApiProperty({
        description: '14-01-2025',
        example: false
    })
    @IsNotEmpty()
    departureTime: Date;

    @ApiProperty({
        description: '14-01-2025',
        example: false
    })
    @IsNotEmpty()
    arrivalTime: Date;

    @ApiProperty({
        description: 'destination field',
        example: 'example string'
    })
    @IsNotEmpty()
    @IsString()
    destination: string;

    @ApiProperty({
        description: 'origin field',
        example: 'example string'
    })
    @IsNotEmpty()
    @IsString()
    origin: string;

    @ApiProperty({
        description : 'Estimated time to reach the destination in hours',
        example : '48'
    })
    @IsOptional()
    estimatedTimeToReach : number

    @ApiProperty({
        description: 'status field',
        example: false
    })
    @IsNotEmpty()
    status: FlightStatus;

    @ApiProperty({
        description: 'FlightClass Category Field with price and seats',
        example: `[{ flightClass: 'ECONOMY', price: 0, seats: 0 }, {
            flightClass: 'BUSINESS', price: 0, seats: 0}, {
            flightClass: 'FIRSTCLASS', price: 0, seats: 0}]`
    })
    @IsArray()
    @IsNotEmpty()
    flightClassCategories: Array<{
        flightClass: FlightClass,
        price: number,
        seats: number
    }>

}
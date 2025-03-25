import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class QueryFlightDto {
    @ApiProperty({
        description : 'The name of the airline',
        required : false
    })
    @IsString()
    @IsOptional()
    airLineName : string

    @ApiProperty({
        description : 'The start date of the flight',
        required : false
    })
    @IsString()
    @IsNotEmpty()
    startDate : string

    @ApiProperty({
        description : 'The end date of the flight',
        required : false
    })
    @IsString()
    @IsNotEmpty()
    endDate : string

    @ApiProperty({
        description : 'The origin of the flight',
        required : false
    })
    @IsString()
    @IsOptional()
    origin : string

    @ApiProperty({
        description : 'The destination of the flight',
        required : false
    })
    @IsString()
    @IsOptional()
    destination : string

    @ApiProperty({
        description : 'Check round trip flights',
        required : false
    })
    @IsOptional()
    isRoundTrip : boolean
}
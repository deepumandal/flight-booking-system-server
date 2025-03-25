import {
    IsString,
    IsNumber,
    IsBoolean,
    IsDate,
    IsOptional,
    IsNotEmpty,
    Matches
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'name field',
        example: 'example string'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'email field',
        example: 'example string'
    })
    @IsNotEmpty()
    @IsString()
    @Matches('^[^@]+@[^@]+\.[^@]+$')
    email: string;

    @ApiProperty({
        description: 'password field',
        example: 'example string'
    })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({
        description: 'contactNumber field',
        example: 'example string'
    })
    @IsNotEmpty()
    @IsString()
    contactNumber: string;
}
import { 
    IsString, 
    IsNumber, 
    IsBoolean, 
    IsDate, 
    IsOptional,
    IsNotEmpty
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {

  @ApiProperty({
    description: 'email field',
    example: 'example string'
})
    @IsNotEmpty()
    @IsString()
  email: string;

  @ApiProperty({
    description: 'password field',
    example: 'example string'
})
    @IsNotEmpty()
    @IsString()
  password: string;


}
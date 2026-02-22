import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'bryan@eazypost.cm' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Bryan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Nkoua' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '123456', description: 'OTP Code' })
  @IsString()
  @IsNotEmpty()
  code: string; 
}
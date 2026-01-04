import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'bryan@easypost.cm', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Min 6 characters' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Bryan', description: 'First Name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Nkouam', description: 'Last Name' })
  @IsString()
  lastName: string;
}
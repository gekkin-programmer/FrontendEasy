import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '237678128452', description: 'Cameroon Phone Number' })
  @IsString()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '237678128452' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456', description: '6-digit Code' })
  @IsString()
  @Length(6, 6)
  code: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, Length, Matches } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    description: 'Phone number to send OTP to',
    example: '+1234567890',
  })
  @IsPhoneNumber()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Phone number to verify',
    example: '+1234567890',
  })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code: string;
}
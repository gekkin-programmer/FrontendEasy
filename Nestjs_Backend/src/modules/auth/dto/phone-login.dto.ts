// import { IsPhoneNumber, IsNotEmpty, IsString } from 'class-validator';

// export class PhoneLoginDto {
//   @IsPhoneNumber()
//   @IsNotEmpty()
//   phone: string;
// }

// export class VerifyOtpDto {
//   @IsPhoneNumber()
//   @IsNotEmpty()
//   phone: string;

//   @IsNotEmpty()
//   @IsString()
//   code: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsNotEmpty, IsString } from 'class-validator';

export class PhoneLoginDto {
  @ApiProperty({
    example: '+237655123456',
    description: 'Numéro de téléphone au format international',
    required: true
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: '+237655123456',
    description: 'Numéro de téléphone',
    required: true
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '123456',
    description: 'Code OTP reçu par SMS',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
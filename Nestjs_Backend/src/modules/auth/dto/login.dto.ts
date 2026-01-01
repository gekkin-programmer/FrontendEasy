// // auth/dto/login.dto.ts
// import { ApiProperty } from '@nestjs/swagger';
// import { IsEmail, IsOptional, IsString } from 'class-validator';

// export class LoginDto {
//   @ApiProperty({ example: 'john@example.com' })
//   @IsEmail()
//   email: string;

//    @IsOptional()
//   @IsString()
//   phone?: string;

//   @ApiProperty({ example: 'Password123!' })
//   @IsString()
//   password: string;
// }
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Adresse email de l\'utilisateur',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+237655123456',
    description: 'Numéro de téléphone de l\'utilisateur',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Mot de passe de l\'utilisateur',
    required: true
  })
  @IsString()
  password: string;
}
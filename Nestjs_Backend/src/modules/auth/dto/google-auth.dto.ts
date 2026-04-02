import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google OAuth authorization code',
    example: '4/0AfJohXm4V...',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Google OAuth ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
  })
  @IsString()
  @IsOptional()
  idToken?: string;

  @ApiProperty({
    description: 'Workspace ID to associate user with',
    example: 'clx1a2b3c4d5e6f7g8h9i0j',
  })
  @IsString()
  @IsOptional()
  workspaceId?: string;
}

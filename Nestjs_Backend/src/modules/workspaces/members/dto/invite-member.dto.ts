import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { WorkspaceRole } from '@prisma/client';

export class InviteMemberDto {
  @ApiProperty({ example: 'colleague@agency.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: WorkspaceRole, example: 'MEMBER' })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { WorkspaceRole } from '@prisma/client';

export class UpdateRoleDto {
  @ApiProperty({ enum: WorkspaceRole })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}

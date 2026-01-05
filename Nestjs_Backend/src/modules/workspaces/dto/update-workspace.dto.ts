import { PartialType } from '@nestjs/swagger';
import { CreateWorkspaceDto } from './create-workspaces.dto';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {}
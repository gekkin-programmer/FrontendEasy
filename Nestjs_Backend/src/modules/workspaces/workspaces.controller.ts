import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspaces.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Workspaces (Agencies)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Agency/Workspace' })
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Req() req) {
    return this.workspacesService.create(createWorkspaceDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List all workspaces I belong to' })
  findAll(@Req() req) {
    return this.workspacesService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of one workspace' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.workspacesService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workspace (Admin only)' })
  update(@Param('id') id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto, @Req() req) {
    return this.workspacesService.update(id, updateWorkspaceDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive workspace (Owner only)' })
  remove(@Param('id') id: string, @Req() req) {
    return this.workspacesService.remove(id, req.user.sub);
  }
}
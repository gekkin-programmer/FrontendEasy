import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard'; 
import { MembersService } from './members.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Workspace Members')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all members' })
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.membersService.findAll(workspaceId);
  }

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Invite a colleague' })
  invite(
    @Param('workspaceId') workspaceId: string, 
    @Body() dto: InviteMemberDto,
    @Req() req
  ) {
    return this.membersService.invite(workspaceId, dto, req.user.sub);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept invitation (Public endpoint usually)' })
  accept(@Body() body: { token: string }) {
    // Basic Base64 decoding
    const decoded = JSON.parse(Buffer.from(body.token, 'base64').toString());
    return this.membersService.acceptInvite(decoded.workspaceId, decoded.email);
  }

  @Patch(':memberId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update member role' })
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateRoleDto,
    @Req() req
  ) {
    return this.membersService.updateRole(workspaceId, memberId, dto, req.user.sub);
  }

  @Delete(':memberId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove member' })
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Req() req
  ) {
    return this.membersService.remove(workspaceId, memberId, req.user.sub);
  }
}
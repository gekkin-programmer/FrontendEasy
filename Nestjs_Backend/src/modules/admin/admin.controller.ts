import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get overall analytics' })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users with search' })
  getUsers(@Query('search') search: string) {
    return this.adminService.getAllUsers(search);
  }

  @Post('access-grants')
  @ApiOperation({ summary: 'Grant premium access to a user' })
  grantAccess(@Req() req, @Body() body: any) {
    return this.adminService.grantAccess(req.user.sub, body);
  }

  @Get('feedback')
  @ApiOperation({ summary: 'Manage user feedback' })
  getFeedback() {
    return this.adminService.getFeedback();
  }
}

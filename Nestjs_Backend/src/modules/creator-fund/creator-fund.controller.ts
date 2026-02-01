import { Controller, Post, Body, Get, UseGuards, Patch, Param } from '@nestjs/common';
import { CreatorFundService } from './creator-fund.service';
import { ApplyCreatorFundDto } from './dto/apply-creator-fund.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Creator Fund')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('creator-fund')
export class CreatorFundController {
  constructor(private readonly creatorFundService: CreatorFundService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Submit application for Creator Fund' })
  apply(@CurrentUser() user: any, @Body() dto: ApplyCreatorFundDto) {
    return this.creatorFundService.apply(user.sub || user.id, dto);
  }

  @Get('my-application')
  @ApiOperation({ summary: 'Check my application status' })
  getMyApplication(@CurrentUser() user: any) {
    return this.creatorFundService.getMyApplication(user.sub || user.id);
  }

  // --- ADMIN ENDPOINTS (Should be guarded by Role in prod) ---
  
  @Get('applications')
  @ApiOperation({ summary: 'List all applications (Admin)' })
  getAllApplications() {
    return this.creatorFundService.getAllApplications();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Approve/Reject application (Admin)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateApplicationStatusDto) {
    return this.creatorFundService.updateStatus(id, dto);
  }
}
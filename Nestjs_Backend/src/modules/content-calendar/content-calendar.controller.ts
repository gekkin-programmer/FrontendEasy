import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ContentCalendarService } from './content-calendar.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Content Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class ContentCalendarController {
  constructor(private readonly calendarService: ContentCalendarService) {}

  @Get()
  @ApiOperation({ summary: 'Get posts for Calendar View' })
  @ApiQuery({ name: 'start', example: '2026-01-01', description: 'Start Date (ISO)' })
  @ApiQuery({ name: 'end', example: '2026-01-31', description: 'End Date (ISO)' })
  getCalendar(
    @Req() req,
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    // Default to current month if no dates provided
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    return this.calendarService.getCalendarEvents(
      req.user.workspaceId, 
      start || defaultStart, 
      end || defaultEnd
    );
  }
}
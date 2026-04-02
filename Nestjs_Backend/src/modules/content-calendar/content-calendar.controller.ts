import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ContentCalendarService } from './content-calendar.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Content Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class ContentCalendarController {
  constructor(private readonly calendarService: ContentCalendarService) {}

  @Get()
  @ApiOperation({ summary: 'Get posts for Calendar View' })
  @ApiQuery({ name: 'workspaceId', required: true })
  @ApiQuery({ name: 'start', required: false })
  @ApiQuery({ name: 'end', required: false })
  getCalendar(
    @Req() req,
    @Query('workspaceId') workspaceId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    // Default to current month if no dates provided
    const now = new Date();
    // Start of current month
    const defaultStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();
    // End of current month
    const defaultEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).toISOString();

    return this.calendarService.getCalendarEvents(
      workspaceId,
      start || defaultStart,
      end || defaultEnd,
    );
  }
}

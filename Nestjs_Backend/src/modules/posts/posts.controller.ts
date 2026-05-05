import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PublisherService } from './publishing/publisher.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { PostStatus } from '@prisma/client';

@ApiTags('Posts & Publishing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly publisherService: PublisherService,
    private readonly prisma: PrismaService,
  ) {}

  // 🛠️ HELPER: Get Workspace ID safely
  private async getWorkspaceId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedWorkspaces: true },
    });
    if (!user || user.ownedWorkspaces.length === 0) {
      throw new UnauthorizedException('User has no workspace');
    }
    return user.ownedWorkspaces[0].id;
  }

  @Post()
  @UseGuards(SubscriptionGuard)
  @ApiOperation({ summary: 'Create a new post' })
  async create(@Body() dto: CreatePostDto, @Req() req) {
    const userId = req.user.sub;

    // Prefer workspaceId from DTO, fallback to first owned workspace if missing
    const workspaceId = dto.workspaceId || (await this.getWorkspaceId(userId));

    return this.postsService.create(dto, userId, workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'List posts (Filter by Status & Search)' })
  @ApiQuery({ name: 'workspaceId', type: String, required: false })
  @ApiQuery({ name: 'status', enum: PostStatus, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  async findAll(
    @Req() req,
    @Query('workspaceId') workspaceId?: string,
    @Query('status') status?: PostStatus,
    @Query('search') search?: string,
  ) {
    const userId = req.user.sub;

    // Prefer requested workspaceId, fallback only if none provided
    const targetWorkspaceId =
      workspaceId || (await this.getWorkspaceId(userId));

    return this.postsService.findAll(targetWorkspaceId, { status, search });
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get posts for calendar (date range)' })
  @ApiQuery({ name: 'start', type: String, required: true })
  @ApiQuery({ name: 'end', type: String, required: true })
  async getCalendar(
    @Query('workspaceId') workspaceId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.postsService.findInDateRange(
      workspaceId,
      new Date(start),
      new Date(end),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post details' })
  async findOne(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId?: string,
    @Req() req?: any,
  ) {
    const targetWorkspaceId =
      workspaceId || (await this.getWorkspaceId(req.user.sub));
    return this.postsService.findOne(id, targetWorkspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a post' })
  update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Req() req) {
    return this.postsService.update(id, dto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  async remove(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId?: string,
    @Req() req?: any,
  ) {
    const targetWorkspaceId =
      workspaceId || (await this.getWorkspaceId(req.user.sub));
    return this.postsService.remove(id, targetWorkspaceId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Manager Approval' })
  async approve(@Param('id') id: string, @Req() req) {
    const result = await this.postsService.approve(id, req.user.sub);
    // No scheduled date → publish immediately instead of waiting for cron
    if (!result.scheduledFor) {
      await this.publisherService.publishPost(id);
    }
    return result;
  }

  @Post(':id/cancel-schedule')
  @ApiOperation({ summary: 'Cancel a scheduled post and return to draft' })
  async cancelSchedule(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId?: string,
    @Req() req?: any,
  ) {
    const targetWorkspaceId =
      workspaceId || (await this.getWorkspaceId(req.user.sub));
    // Ensure post belongs to workspace
    await this.postsService.findOne(id, targetWorkspaceId);
    return this.postsService.cancelSchedule(id);
  }

  @Post(':id/repost')
  @ApiOperation({ summary: 'Clone a published post and publish immediately' })
  async repost(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId: string,
    @Req() req: any,
  ) {
    const targetWorkspaceId =
      workspaceId || (await this.getWorkspaceId(req.user.sub));
    return this.postsService.repost(id, req.user.sub, targetWorkspaceId);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish post immediately' })
  async publish(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId?: string,
    @Req() req?: any,
  ) {
    const targetWorkspaceId =
      workspaceId || (await this.getWorkspaceId(req.user.sub));
    await this.postsService.findOne(id, targetWorkspaceId);
    return this.publisherService.publishPost(id);
  }
}

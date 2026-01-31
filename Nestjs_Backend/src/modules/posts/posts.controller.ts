import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Req, Query, UnauthorizedException 
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PublisherService } from './publishing/publisher.service';
import { CreatePostDto } from './dto/create-post.dto';

// ...
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly publisherService: PublisherService,
    private readonly prisma: PrismaService
  ) {}

  // 🛠️ HELPER: Get Workspace ID safely
  private async getWorkspaceId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedWorkspaces: true }
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
    // 👇 FIX: Manually get ID
    const workspaceId = await this.getWorkspaceId(userId); 
    
    return this.postsService.create(dto, userId, workspaceId); 
  }

  @Get()
  @ApiOperation({ summary: 'List posts (Filter by Status & Search)' })
  @ApiQuery({ name: 'status', enum: PostStatus, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  async findAll(@Req() req, @Query('status') status?: PostStatus, @Query('search') search?: string) {
    const userId = req.user.sub;
    // 👇 FIX: Manually get ID
    const workspaceId = await this.getWorkspaceId(userId);

    return this.postsService.findAll(workspaceId, { status, search });
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get posts for calendar (date range)' })
  @ApiQuery({ name: 'start', type: String, required: true })
  @ApiQuery({ name: 'end', type: String, required: true })
  async getCalendar(@Query('workspaceId') workspaceId: string, @Query('start') start: string, @Query('end') end: string) {
    return this.postsService.findInDateRange(workspaceId, new Date(start), new Date(end));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post details' })
  async findOne(@Param('id') id: string, @Req() req) {
    const workspaceId = await this.getWorkspaceId(req.user.sub);
    return this.postsService.findOne(id, workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a post' })
  update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Req() req) {
    return this.postsService.update(id, dto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  async remove(@Param('id') id: string, @Req() req) {
    const workspaceId = await this.getWorkspaceId(req.user.sub);
    return this.postsService.remove(id, workspaceId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Manager Approval' })
  approve(@Param('id') id: string, @Req() req) {
    return this.postsService.approve(id, req.user.sub);
  }

  @Post(':id/cancel-schedule')
  @ApiOperation({ summary: 'Cancel a scheduled post and return to draft' })
  async cancelSchedule(@Param('id') id: string, @Req() req) {
    const workspaceId = await this.getWorkspaceId(req.user.sub);
    // Ensure post belongs to workspace
    await this.postsService.findOne(id, workspaceId);
    return this.postsService.cancelSchedule(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish post immediately' })
  async publish(@Param('id') id: string, @Req() req) {
    const workspaceId = await this.getWorkspaceId(req.user.sub);
    await this.postsService.findOne(id, workspaceId);
    return this.publisherService.publishPost(id);
  }
}
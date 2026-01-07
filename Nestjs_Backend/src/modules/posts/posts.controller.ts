import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Req, Query 
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostStatus } from '@prisma/client';

@ApiTags('Posts & Publishing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  create(@Body() dto: CreatePostDto, @Req() req) {
    // Assume user is in at least 1 workspace. In prod, pass workspaceId in header/body.
    return this.postsService.create(dto, req.user.sub, req.user.workspaceId); 
  }

  @Get()
  @ApiOperation({ summary: 'List posts (Filter by Status)' })
  @ApiQuery({ name: 'status', enum: PostStatus, required: false })
  findAll(@Req() req, @Query('status') status?: PostStatus) {
    // We need to fetch the user to know their workspaceId if not in JWT
    // For now, let's assume we fetch it via a service helper or it's in JWT
    return this.postsService.findAll(req.user.workspaceId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post details' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.postsService.findOne(id, req.user.workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a post' })
  update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Req() req) {
    return this.postsService.update(id, dto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  remove(@Param('id') id: string, @Req() req) {
    return this.postsService.remove(id, req.user.workspaceId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Manager Approval' })
  approve(@Param('id') id: string, @Req() req) {
    return this.postsService.approve(id, req.user.sub);
  }
}
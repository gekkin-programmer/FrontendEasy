import { 
  Controller, Post, Get, UseInterceptors, UploadedFile, UseGuards, Req, 
  ParseFilePipe, MaxFileSizeValidator, UnauthorizedException, Param, Delete, Query, Body, Patch
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Media Library')
@ApiBearerAuth()
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'List all media and folders' })
  @ApiQuery({ name: 'folderId', required: false })
  async findAll(@Req() req, @Query('folderId') folderId?: string) {
    const userId = req.user?.sub || req.user?.id;
    return this.mediaService.findAll(userId, folderId);
  }

  @Post('folders')
  @ApiOperation({ summary: 'Create a new folder' })
  async createFolder(@Req() req, @Body() body: { name: string, parentId?: string }) {
    const userId = req.user?.sub || req.user?.id;
    return this.mediaService.createFolder(body.name, userId, body.parentId);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload an image/video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folderId: { type: 'string' }
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req,
    @Body('folderId') folderId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), 
        ],
      }),
    )
    file: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.mediaService.processUpload(file, userId, folderId);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move asset to folder' })
  async moveAsset(@Param('id') id: string, @Body() body: { folderId: string | null }, @Req() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.mediaService.moveAsset(id, body.folderId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media file' })
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.mediaService.remove(id, userId);
  }

  @Delete('folders/:id')
  @ApiOperation({ summary: 'Delete a folder' })
  async removeFolder(@Param('id') id: string, @Req() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.mediaService.removeFolder(id, userId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get current storage usage' })
  async getUsage(@Query('workspaceId') workspaceId: string) {
    return this.mediaService.getStorageUsage(workspaceId);
  }
}

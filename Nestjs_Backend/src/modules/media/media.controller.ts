import { 
  Controller, Post, Get, UseInterceptors, UploadedFile, UseGuards, Req, 
  ParseFilePipe, MaxFileSizeValidator, UnauthorizedException, Param, Delete, Query 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Media Library')
@ApiBearerAuth()
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // List all media for the user's workspace
  @Get()
  @ApiOperation({ summary: 'List all media files for user workspace' })
  async findAll(@Req() req) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new UnauthorizedException('User ID invalid');
    return this.mediaService.findAll(userId);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload an image/video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req,
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

    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }

    return this.mediaService.processUpload(file, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media file' })
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.mediaService.remove(id, userId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get current storage usage' })
  async getUsage(@Query('workspaceId') workspaceId: string) {
    return this.mediaService.getStorageUsage(workspaceId);
  }
}
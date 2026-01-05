import { 
  Controller, Post, UseInterceptors, UploadedFile, UseGuards, Req, 
  ParseFilePipe, MaxFileSizeValidator, UnauthorizedException 
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
    // 🕵️ DEBUGGING: Print the user object to the terminal
    console.log('🔍 Request User:', req.user);

    // Safety Check: Get ID from 'sub' OR 'userId'
    const userId = req.user?.sub || req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }

    return this.mediaService.processUpload(file, userId);
  }
}
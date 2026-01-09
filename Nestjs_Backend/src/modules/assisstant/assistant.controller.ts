import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  UseGuards, 
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssistantService } from './assistant.service';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('voice-command')
  @ApiOperation({ summary: 'Upload voice note to schedule posts' })
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
  async handleVoiceCommand(
    @Req() req,
    @UploadedFile() file: any,
  ) {
    console.log(" Received File:", file);
    return this.assistantService.processVoiceCommand(file, req.user.sub);
  }
}
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChannelDto, CreateMessageDto } from './dto/create-message.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Workspace Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ➤ CHANNELS
  @Post('workspaces/:workspaceId/channels')
  @ApiOperation({ summary: 'Create a new channel' })
  createChannel(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateChannelDto,
    @Req() req,
  ) {
    return this.chatService.createChannel(workspaceId, req.user.sub, dto);
  }

  @Get('workspaces/:workspaceId/channels')
  @ApiOperation({ summary: 'List channels in workspace' })
  getChannels(@Param('workspaceId') workspaceId: string, @Req() req) {
    return this.chatService.getChannels(workspaceId, req.user.sub);
  }

  // ➤ MESSAGES
  @Post('channels/:channelId/messages')
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(
    @Param('channelId') channelId: string,
    @Body() dto: CreateMessageDto,
    @Req() req,
  ) {
    return this.chatService.sendMessage(channelId, req.user.sub, dto);
  }

  @Get('channels/:channelId/messages')
  @ApiOperation({ summary: 'Get chat history' })
  getMessages(@Param('channelId') channelId: string, @Req() req) {
    return this.chatService.getMessages(channelId, req.user.sub);
  }
}

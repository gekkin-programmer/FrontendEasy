import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsapp: WhatsAppService) {}

  // ─── Embedded Signup callback ─────────────────────────────────────────────

  @Post('connect')
  @UseGuards(JwtAuthGuard)
  async connect(
    @Body() body: { workspaceId: string; code: string },
  ) {
    return this.whatsapp.connectFromEmbeddedSignup(body.workspaceId, body.code);
  }

  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  disconnect(@Query('workspaceId') workspaceId: string) {
    return this.whatsapp.disconnect(workspaceId);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Query('workspaceId') workspaceId: string) {
    return this.whatsapp.getStatus(workspaceId);
  }

  // ─── Webhook (Meta GET verification + POST events) ────────────────────────

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const result = this.whatsapp.verifyWebhook(mode, token, challenge);
    res.status(200).send(result);
  }

  @Post('webhook')
  @HttpCode(200)
  handleWebhook(@Body() body: any) {
    void this.whatsapp.handleWebhookEvent(body);
    return { received: true };
  }

  // ─── Unified Inbox ────────────────────────────────────────────────────────

  @Get('inbox')
  @UseGuards(JwtAuthGuard)
  getInbox(@Query('workspaceId') workspaceId: string) {
    return this.whatsapp.getInbox(workspaceId);
  }

  @Get('inbox/:id')
  @UseGuards(JwtAuthGuard)
  getConversation(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.whatsapp.getConversation(workspaceId, id);
  }

  @Post('inbox/:id/send')
  @UseGuards(JwtAuthGuard)
  sendMessage(
    @Param('id') id: string,
    @Body() body: { workspaceId: string; text: string },
  ) {
    return this.whatsapp.sendMessage(body.workspaceId, id, body.text);
  }

  @Post('inbox/:id/read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  markRead(
    @Param('id') id: string,
    @Body() body: { workspaceId: string },
  ) {
    return this.whatsapp.markRead(body.workspaceId, id);
  }
}

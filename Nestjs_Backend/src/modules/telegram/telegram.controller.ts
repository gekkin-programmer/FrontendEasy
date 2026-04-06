import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TelegramService } from './telegram.service';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly telegramService: TelegramService) {}

  /**
   * Webhook endpoint — Telegram calls this for every update.
   * Must be accessible without JWT auth.
   */
  @Post('webhook')
  @ApiOperation({ summary: 'Telegram webhook (called by Telegram servers)' })
  async webhook(@Body() update: any) {
    await this.telegramService.handleWebhookUpdate(update);
    return { ok: true };
  }

  /**
   * Generate a short-lived link token for the logged-in user.
   * Frontend shows this token as "Send /link TOKEN to @Eazy_Post_bot"
   */
  @Post('link-token')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Generate a Telegram link token for the current user' })
  async generateLinkToken(@Req() req: any, @Body() body: { workspaceId?: string }) {
    const userId = req.user.sub || req.user.id;
    const token = await this.telegramService.generateLinkToken(userId, body.workspaceId);
    return { token, expiresInMinutes: 15 };
  }

  /**
   * Manually register webhook — useful after deploying to a new domain.
   * Protected so only authenticated admins can call it.
   */
  @Get('setup-webhook')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Register webhook URL with Telegram (admin action)' })
  async setupWebhook(@Req() _req: any) {
    const backendUrl = (process.env.BACKEND_URL || 'https://backend-eazypost.mbokofit.com').replace(/\/$/, '');
    const webhookUrl = `${backendUrl}/api/telegram/webhook`;
    await this.telegramService.setWebhook(webhookUrl);
    return { webhookUrl, status: 'registered' };
  }
}

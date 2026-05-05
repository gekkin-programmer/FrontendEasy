import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Param,
  Delete,
  Query,
  Patch,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SocialAccountsService } from './social-accounts.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

// Guards
import { FacebookConnectGuard } from './guards/facebook-connect.guard';
import { LinkedInConnectGuard } from './guards/linkedin-connect.guard';
import { TwitterConnectGuard } from './guards/twitter-connect.guard';
import { TikTokConnectGuard } from './guards/tiktok-connect.guard';
import { YoutubeConnectGuard } from './guards/youtube-connect.guard';
import { WhatsappConnectGuard } from './guards/whatsapp-connect.guard';
import { SnapchatConnectGuard } from './guards/snapchat-connect.guard';
import { PinterestConnectGuard } from './guards/pinterest-connect.guard';
import { DiscordConnectGuard } from './guards/discord-connect.guard';
import { InstagramBusinessConnectGuard } from './guards/instagram-business-connect.guard';
import { ThreadsConnectGuard } from './guards/threads-connect.guard';

@ApiTags('Social Accounts')
@Controller('social-accounts')
export class SocialAccountsController {
  constructor(
    private readonly socialAccountsService: SocialAccountsService,
    private readonly jwtService: JwtService,
  ) {}

  // =================================================================
  // 1. LIST & MANAGE ACCOUNTS
  // =================================================================

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List connected accounts' })
  findAll(@Req() req, @Query('workspaceId') workspaceId: string) {
    return this.socialAccountsService.findAll(
      req.user.sub || req.user.id,
      workspaceId,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Disconnect an account' })
  remove(@Param('id') id: string, @Req() req) {
    return this.socialAccountsService.disconnect(
      id,
      req.user.sub || req.user.id,
    );
  }

  @Post(':id/sync')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Trigger historical sync manually' })
  syncAccount(@Param('id') id: string, @Req() req) {
    return this.socialAccountsService.triggerManualSync(
      id,
      req.user.sub || req.user.id,
    );
  }

  @Patch(':id/pause')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Toggle queue pause for a social account' })
  togglePause(@Param('id') id: string, @Req() req) {
    return this.socialAccountsService.togglePause(
      id,
      req.user.sub || req.user.id,
    );
  }

  @Patch(':id/expire')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'FOR TESTING: Manually expire a token' })
  expireAccount(@Param('id') id: string) {
    return this.socialAccountsService.expireToken(id);
  }

  // =================================================================
  // 2. META (Facebook & Instagram)
  // =================================================================

  @Get('connect/facebook')
  @UseGuards(FacebookConnectGuard)
  async connectFacebook(
    @Query('workspaceId') _workspaceId: string,
    @Query('token') _token: string,
  ) {
    // Redirects to Facebook
  }

  @Get('connect/instagram')
  @UseGuards(FacebookConnectGuard) // Use robust Facebook Login instead of native Instagram Login
  async connectInstagram(
    @Query('workspaceId') _workspaceId: string,
    @Query('token') _token: string,
  ) {
    // Redirects to Facebook Login (which already requests required Instagram permissions)
  }

  @Get('callback/facebook')
  @UseGuards(FacebookConnectGuard)
  async facebookCallback(@Req() req, @Res() res: Response) {
    try {
      if (req.user.platform === 'WHATSAPP') {
        await this.socialAccountsService.handleWhatsappCallback(req.user);
      } else if (req.user.platform === 'INSTAGRAM') {
        await this.socialAccountsService.handleInstagramCallback(req.user);
      } else {
        await this.socialAccountsService.handleFacebookCallback(req.user);
      }
      this.redirectHome(res, req.user.workspaceId);
    } catch (e) {
      this.redirectError(res, req.user.workspaceId, e.message);
    }
  }

  @Get('callback/instagram-business')
  @UseGuards(InstagramBusinessConnectGuard)
  async instagramBusinessCallback(@Req() req, @Res() res: Response) {
    try {
      await this.socialAccountsService.handleInstagramBusinessCallback(req.user);
      this.redirectHome(res, req.user.workspaceId);
    } catch (e) {
      this.redirectError(res, req.user.workspaceId, e.message);
    }
  }

  // =================================================================
  // 3. LINKEDIN
  // =================================================================

  @Get('connect/linkedin')
  @UseGuards(LinkedInConnectGuard)
  async connectLinkedin(
    @Query('workspaceId') _workspaceId: string,
    @Query('token') _token: string,
  ) {
    // Redirects to LinkedIn
  }

  @Get('callback/linkedin')
  @UseGuards(LinkedInConnectGuard)
  async linkedinCallback(@Req() req, @Res() res: Response) {
    try {
      await this.socialAccountsService.handleLinkedinCallback(req.user);
      this.redirectHome(res, req.user.workspaceId);
    } catch (e) {
      this.redirectError(res, req.user.workspaceId, e.message);
    }
  }

  // =================================================================
  // 4. TWITTER (X)
  // =================================================================

  @Get('connect/twitter')
  @UseGuards(TwitterConnectGuard)
  async connectTwitter(
    @Query('workspaceId') _workspaceId: string,
    @Query('token') _token: string,
  ) {
    // Redirects to Twitter
  }

  @Get('callback/twitter')
  @UseGuards(TwitterConnectGuard)
  async twitterCallback(@Req() req, @Res() res: Response) {
    try {
      await this.socialAccountsService.handleTwitterCallback(req.user);
      this.redirectHome(res, req.user.workspaceId);
    } catch (e) {
      this.redirectError(res, req.user.workspaceId, e.message);
    }
  }

  // =================================================================
  // 5. YOUTUBE (Google)
  // =================================================================

  @Get('connect/youtube')
  @UseGuards(YoutubeConnectGuard)
  async connectYoutube(
    @Query('workspaceId') _workspaceId: string,
    @Query('token') _token: string,
  ) {
    // Redirects to Google
  }

  @Get('callback/youtube')
  @UseGuards(YoutubeConnectGuard)
  async youtubeCallback(@Req() req, @Res() res: Response) {
    try {
      await this.socialAccountsService.handleYoutubeCallback(req.user);
      this.redirectHome(res, req.user.workspaceId);
    } catch (e) {
      this.redirectError(res, req.user.workspaceId, e.message);
    }
  }

  // =================================================================
  // 6. WHATSAPP (Meta Business)
  // =================================================================

  @Get('connect/whatsapp')
  @UseGuards(WhatsappConnectGuard)
  async connectWhatsapp(
    @Query('workspaceId') _workspaceId: string,
    @Query('token') _token: string,
  ) {
    // Redirects to Facebook Login with 'whatsapp_business_management' scope
  }

  @Get('callback/whatsapp')
  @UseGuards(WhatsappConnectGuard)
  async whatsappCallback(@Req() req, @Res() res: Response) {
    try {
      await this.socialAccountsService.handleWhatsappCallback(req.user);
      this.redirectHome(res, req.user.workspaceId);
    } catch (e) {
      this.redirectError(res, req.user.workspaceId, e.message);
    }
  }

  // =================================================================
  // 7. TIKTOK
  // =================================================================

  @Get('connect/tiktok')
  @UseGuards(TikTokConnectGuard)
  async connectTikTok(
    @Query('workspaceId') _workspaceId: string,
    @Query('token') _token: string,
  ) {
    // Redirects to TikTok
  }

  @Get('callback/tiktok')
  @UseGuards(TikTokConnectGuard)
  async tiktokCallback(@Req() req, @Res() res: Response) {
    try {
      await this.socialAccountsService.handleTikTokCallback(req.user);
      this.redirectHome(res, req.user.workspaceId);
    } catch (e) {
      this.redirectError(res, req.user.workspaceId, e.message);
    }
  }

  // =================================================================
  // 8. PLACEHOLDERS (Prevent 404s for buttons)
  // =================================================================

  // =================================================================
  // 8. SNAPCHAT
  // =================================================================

  @Get('connect/snapchat')
  @UseGuards(SnapchatConnectGuard)
  async connectSnapchat(
    @Query('workspaceId') _workspaceId: string,
    @Query('token') _token: string,
  ) {
    // Redirects to Snapchat
  }

  @Get('callback/snapchat')
  @UseGuards(SnapchatConnectGuard)
  async snapchatCallback(@Req() req, @Res() res: Response) {
    try {
      await this.socialAccountsService.handleSnapchatCallback(req.user);
      this.redirectHome(res, req.user.workspaceId);
    } catch (e) {
      this.redirectError(res, req.user.workspaceId, e.message);
    }
  }

  // =================================================================
  // 9. PINTEREST
  // =================================================================

  @Get('connect/pinterest')
  @UseGuards(PinterestConnectGuard)
  async connectPinterest(
    @Query('workspaceId') _workspaceId: string,
    @Query('token') _token: string,
  ) {
    // Redirects to Pinterest
  }

  @Get('callback/pinterest')
  @UseGuards(PinterestConnectGuard)
  async pinterestCallback(@Req() req, @Res() res: Response) {
    try {
      await this.socialAccountsService.handlePinterestCallback(req.user);
      this.redirectHome(res, req.user.workspaceId);
    } catch (e) {
      this.redirectError(res, req.user.workspaceId, e.message);
    }
  }

  // =================================================================
  // 10. DISCORD
  // =================================================================

  @Get('connect/discord')
  @UseGuards(DiscordConnectGuard)
  async connectDiscord(
    @Query('workspaceId') _workspaceId: string,
    @Query('token') _token: string,
  ) {
    // Redirects to Discord
  }

  @Get('callback/discord')
  @UseGuards(DiscordConnectGuard)
  async discordCallback(@Req() req, @Res() res: Response) {
    try {
      await this.socialAccountsService.handleDiscordCallback(req.user);
      this.redirectHome(res, req.user.workspaceId);
    } catch (e) {
      this.redirectError(res, req.user.workspaceId, e.message);
    }
  }

  // =================================================================
  // 11. THREADS
  // =================================================================

  @Get('connect/threads')
  @UseGuards(ThreadsConnectGuard)
  async connectThreads(
    @Query('workspaceId') _workspaceId: string,
    @Query('token') _token: string,
  ) {
    // Redirects to Threads
  }

  @Get('callback/threads')
  @UseGuards(ThreadsConnectGuard)
  async threadsCallback(@Req() req, @Res() res: Response) {
    try {
      await this.socialAccountsService.handleThreadsCallback(req.user);
      this.redirectHome(res, req.user.workspaceId);
    } catch (e) {
      this.redirectError(res, req.user.workspaceId, e.message);
    }
  }

  // =================================================================
  // 12. PLACEHOLDERS
  // =================================================================

  @Get('connect/reddit')
  connectReddit(@Res() res: Response) {
    this.comingSoon(res, 'Reddit');
  }

  // =================================================================
  // 12. WEBHOOKS
  // =================================================================

  @Get('webhook/tiktok')
  @Public()
  @ApiOperation({ summary: 'TikTok webhook verification (GET challenge)' })
  verifyTikTokWebhook(@Query('challenge') challenge: string, @Res() res: Response) {
    if (challenge) {
      return res.status(200).send(challenge);
    }
    return res.status(200).send('OK');
  }

  @Post('webhook/tiktok')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'TikTok webhook event handler' })
  handleTikTokWebhook(@Body() body: any) {
    return this.socialAccountsService.handleTikTokWebhook(body);
  }

  @Get('webhook/instagram')
  @Public()
  @ApiOperation({ summary: 'Instagram webhook verification (GET challenge)' })
  verifyInstagramWebhook(@Query() query: any, @Res() res: Response) {
    const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
    if (
      query['hub.mode'] === 'subscribe' &&
      query['hub.verify_token'] === verifyToken
    ) {
      return res.status(200).send(query['hub.challenge']);
    }
    return res.status(403).send('Forbidden');
  }

  @Post('webhook/instagram')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Instagram webhook event handler' })
  handleInstagramWebhook(
    @Headers('x-hub-signature-256') signature: string,
    @Body() body: any,
  ) {
    return this.socialAccountsService.handleInstagramWebhook(signature, body);
  }

  // --- HELPERS ---

  private redirectHome(res: Response, workspaceId: string) {
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontend}/dashboard/${workspaceId}?success=true`);
  }

  private redirectError(res: Response, workspaceId: string, message: string) {
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3001';
    // Extract clean error code (messages are formatted as "CODE: description")
    const errorCode = message.split(':')[0].trim();
    res.redirect(
      `${frontend}/dashboard/${workspaceId}?error=${encodeURIComponent(errorCode)}`,
    );
  }

  private comingSoon(res: Response, platform: string) {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
        <h1 style="font-size: 40px;">🚧 Coming Soon</h1>
        <p>The <strong>${platform}</strong> integration is currently being built.</p>
        <p>Check back later!</p>
        <button onclick="window.history.back()" style="padding: 10px 20px; cursor: pointer;">Go Back</button>
      </div>
    `);
  }
}

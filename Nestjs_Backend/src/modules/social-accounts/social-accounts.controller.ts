import { 
  Controller, Get, Post, Body, UseGuards, Req, Res, Param, Delete, 
  UnauthorizedException, Query, NotImplementedException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialAccountsService } from './social-accounts.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

// Guards
import { FacebookConnectGuard } from './guards/facebook-connect.guard';
import { LinkedInConnectGuard } from './guards/linkedin-connect.guard';
import { TwitterConnectGuard } from './guards/twitter-connect.guard';
import { YoutubeConnectGuard } from './guards/youtube-connect.guard';
import { WhatsappConnectGuard } from './guards/whatsapp-connect.guard'; // ➤ NEW IMPORT

@ApiTags('Social Accounts')
@Controller('social-accounts')
export class SocialAccountsController {
  constructor(
    private readonly socialAccountsService: SocialAccountsService,
    private readonly jwtService: JwtService
  ) {}

  // =================================================================
  // 1. LIST & MANAGE ACCOUNTS
  // =================================================================

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List connected accounts' })
  findAll(@Req() req) {
    return this.socialAccountsService.findAll(req.user.sub || req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Disconnect an account' })
  remove(@Param('id') id: string, @Req() req) {
    return this.socialAccountsService.disconnect(id, req.user.sub || req.user.id);
  }

  @Post(':id/sync')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Trigger historical sync manually' })
  syncAccount(@Param('id') id: string, @Req() req) {
    return this.socialAccountsService.triggerManualSync(id, req.user.sub || req.user.id);
  }

  // =================================================================
  // 2. META (Facebook & Instagram)
  // =================================================================

  @Get('connect/facebook')
  @UseGuards(FacebookConnectGuard)
  async connectFacebook(@Query('workspaceId') workspaceId: string, @Query('token') token: string) {
    // Redirects to Facebook
  }

  @Get('connect/instagram')
  @UseGuards(FacebookConnectGuard)
  async connectInstagram(@Query('workspaceId') workspaceId: string, @Query('token') token: string) {
    // Redirects to Facebook (Instagram Business uses FB Login)
  }

  @Get('callback/facebook')
  @UseGuards(FacebookConnectGuard)
  async facebookCallback(@Req() req, @Res() res: Response) {
    await this.socialAccountsService.handleFacebookCallback(req.user);
    this.redirectHome(res, req.user.workspaceId);
  }

  // =================================================================
  // 3. LINKEDIN
  // =================================================================

  @Get('connect/linkedin')
  @UseGuards(LinkedInConnectGuard)
  async connectLinkedin(@Query('workspaceId') workspaceId: string, @Query('token') token: string) {
    // Redirects to LinkedIn
  }

  @Get('linkedin/callback')
  @UseGuards(LinkedInConnectGuard)
  async linkedinCallback(@Req() req, @Res() res: Response) {
    await this.socialAccountsService.handleLinkedinCallback(req.user);
    this.redirectHome(res, req.user.workspaceId);
  }

  // =================================================================
  // 4. TWITTER (X)
  // =================================================================

  @Get('connect/twitter')
  @UseGuards(TwitterConnectGuard)
  async connectTwitter(@Query('workspaceId') workspaceId: string, @Query('token') token: string) {
    // Redirects to Twitter
  }

  @Get('twitter/callback')
  @UseGuards(TwitterConnectGuard)
  async twitterCallback(@Req() req, @Res() res: Response) {
    await this.socialAccountsService.handleTwitterCallback(req.user);
    this.redirectHome(res, req.user.workspaceId);
  }

  // =================================================================
  // 5. YOUTUBE (Google)
  // =================================================================

  @Get('connect/youtube')
  @UseGuards(YoutubeConnectGuard)
  async connectYoutube(@Query('workspaceId') workspaceId: string, @Query('token') token: string) {
    // Redirects to Google
  }

  @Get('youtube/callback')
  @UseGuards(YoutubeConnectGuard)
  async youtubeCallback(@Req() req, @Res() res: Response) {
    await this.socialAccountsService.handleYoutubeCallback(req.user);
    this.redirectHome(res, req.user.workspaceId);
  }

  // =================================================================
  // 6. WHATSAPP (Meta Business)
  // =================================================================

  @Get('connect/whatsapp')
  @UseGuards(WhatsappConnectGuard)
  async connectWhatsapp(@Query('workspaceId') workspaceId: string, @Query('token') token: string) {
    // Redirects to Facebook Login with 'whatsapp_business_management' scope
  }

  @Get('callback/whatsapp')
  @UseGuards(WhatsappConnectGuard)
  async whatsappCallback(@Req() req, @Res() res: Response) {
    await this.socialAccountsService.handleWhatsappCallback(req.user);
    this.redirectHome(res, req.user.workspaceId);
  }

  // =================================================================
  // 7. PLACEHOLDERS (Prevent 404s for buttons)
  // =================================================================

  @Get('connect/tiktok')
  connectTikTok(@Res() res: Response) { this.comingSoon(res, 'TikTok'); }

  @Get('connect/pinterest')
  connectPinterest(@Res() res: Response) { this.comingSoon(res, 'Pinterest'); }

  @Get('connect/reddit')
  connectReddit(@Res() res: Response) { this.comingSoon(res, 'Reddit'); }

  // --- HELPERS ---

  private redirectHome(res: Response, workspaceId: string) {
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3001';
    // Redirect to the specific workspace dashboard to refresh data
    res.redirect(`${frontend}/dashboard/${workspaceId}?success=true`);
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
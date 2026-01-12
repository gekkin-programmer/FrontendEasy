import { Controller, Get, UseGuards, Req, Res, Param, Delete, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialAccountsService } from './social-accounts.service';
import { FacebookConnectGuard } from './guards/facebook-connect.guard';
import { LinkedInConnectGuard } from './guards/linkedin-connect.guard';
import { TikTokConnectGuard } from './guards/tiktok-connect.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';


@ApiTags('Social Accounts')
@Controller('social-accounts')
export class SocialAccountsController {
  constructor(private readonly socialAccountsService: SocialAccountsService) {}

  // =================================================================
  // 1. LIST & MANAGE ACCOUNTS
  // =================================================================

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List connected accounts' })
  findAll(@Req() req) {
    return this.socialAccountsService.findAll(req.user.sub);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Disconnect an account' })
  remove(@Param('id') id: string, @Req() req) {
    return this.socialAccountsService.disconnect(id, req.user.sub);
  }

  // =================================================================
  // 2. FACEBOOK FLOW
  // =================================================================

  @Get('connect/facebook')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async connectFacebook(@Req() req, @Res() res: Response) {
    // 1. Save User ID to Cookie (5 mins expiry)
    res.cookie('auth_state', req.user.sub, { 
        httpOnly: true, 
        signed: true, 
        maxAge: 300000,
        sameSite: 'none', // Crucial for cross-site redirects (Ngrok/Render)
        secure: true      // Crucial for HTTPS
    });
    
    // 2. Redirect to internal route that triggers Passport
    res.redirect('/api/social-accounts/auth/facebook');
  }

  @Get('auth/facebook')
  @UseGuards(FacebookConnectGuard)
  facebookTrigger() {}

  @Get('callback/facebook')
  @UseGuards(FacebookConnectGuard)
  async facebookCallback(@Req() req, @Res() res: any) {
    await this.handleCallback(req, res, 'facebook');
  }

  // =================================================================
  // 3. LINKEDIN FLOW
  // =================================================================

  @Get('connect/linkedin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async connectLinkedIn(@Req() req, @Res() res: Response) {
    res.cookie('auth_state', req.user.sub, { httpOnly: true, signed: true, maxAge: 300000, sameSite: 'none', secure: true });
    res.redirect('/api/social-accounts/auth/linkedin');
  }

  @Get('auth/linkedin')
  @UseGuards(LinkedInConnectGuard)
  linkedinTrigger() {}

  @Get('callback/linkedin')
  @UseGuards(LinkedInConnectGuard)
  async linkedinCallback(@Req() req, @Res() res: any) {
    await this.handleCallback(req, res, 'linkedin');
  }

  // =================================================================
  // 4. TIKTOK FLOW
  // =================================================================

  @Get('connect/tiktok')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async connectTikTok(@Req() req, @Res() res: Response) {
    res.cookie('auth_state', req.user.sub, { httpOnly: true, signed: true, maxAge: 300000, sameSite: 'none', secure: true });
    res.redirect('/api/social-accounts/auth/tiktok');
  }

  @Get('auth/tiktok')
  @UseGuards(TikTokConnectGuard)
  tiktokTrigger() {}

  @Get('callback/tiktok')
  @UseGuards(TikTokConnectGuard)
  async tiktokCallback(@Req() req, @Res() res: any) {
    await this.handleCallback(req, res, 'tiktok');
  }

  // =================================================================
  // 5. YOUTUBE FLOW
  // =================================================================

  @Get('connect/youtube')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async connectYoutube(@Req() req, @Res() res: Response) {
    res.cookie('auth_state', req.user.sub, { httpOnly: true, signed: true, maxAge: 300000, sameSite: 'none', secure: true });
    res.redirect('/api/social-accounts/auth/youtube');
  }

  @Get('auth/youtube')
  @UseGuards(AuthGuard('youtube-connect'))
  youtubeTrigger() {}

  @Get('callback/youtube')
  @UseGuards(AuthGuard('youtube-connect'))
  async youtubeCallback(@Req() req, @Res() res: any) {
    await this.handleCallback(req, res, 'youtube');
  }

  // =================================================================
  // 🛠️ HELPER
  // =================================================================
  private async handleCallback(req: any, res: any, platform: string) {
    const profile = req.user;
    
    // 1. Read Cookie
    const userId = req.signedCookies['auth_state'];

    if (!userId) {
       console.error(`❌ Missing Auth Cookie for ${platform}`);
       const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
       return res.redirect(`${frontendUrl}/dashboard?error=session_expired`);
    }

    // 2. Link Account
    await this.socialAccountsService.linkAccount(userId, profile);
    
    // 3. Clear Cookie
    res.clearCookie('auth_state', { sameSite: 'none', secure: true });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/dashboard?social_connected=true&platform=${platform}`);
  }
}
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
  UnauthorizedException, 
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialAccountsService } from './social-accounts.service';
import { FacebookConnectGuard } from './guards/facebook-connect.guard';
import { LinkedInConnectGuard } from './guards/linkedin-connect.guard';
import { TikTokConnectGuard } from './guards/tiktok-connect.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

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

  // ➤ NEW: MANUAL SYNC TRIGGER
  @Post(':id/sync')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Trigger historical sync manually' })
  syncAccount(@Param('id') id: string, @Req() req) {
    return this.socialAccountsService.triggerManualSync(id, req.user.sub);
  }

  // =================================================================
  // 2. FACEBOOK FLOW
  // =================================================================

  @Get('connect/facebook')
  @ApiOperation({ summary: 'Initiate Facebook OAuth (Browser Redirect)' })
  async connectFacebook(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new UnauthorizedException('No auth token provided');

    try {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;

        res.cookie('auth_state', userId, { 
            httpOnly: true, 
            signed: true, 
            maxAge: 300000,
            sameSite: 'none', 
            secure: true      
        });
        
        res.redirect('/api/social-accounts/auth/facebook');
    } catch (e) {
        throw new UnauthorizedException('Invalid or Expired Token');
    }
  }

  @Get('auth/facebook')
  @UseGuards(FacebookConnectGuard)
  facebookTrigger() {}

  @Get('callback/facebook')
  @UseGuards(FacebookConnectGuard)
  async facebookCallback(@Req() req, @Res() res: any) {
    const { accessToken } = req.user; 
    res.cookie('fb_pending_token', accessToken, { 
        httpOnly: true, 
        signed: true, 
        maxAge: 300000, // 5 mins
        sameSite: 'none', 
        secure: true 
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/dashboard?social_selection=facebook&exchange_token=${accessToken}`);
  }

  @Get('facebook/pages')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List Facebook Pages to select' })
  async listFacebookPages(
    @Req() req, 
    @Query('exchange_token') queryToken: string 
  ) {
    const fbToken = queryToken || req.signedCookies['fb_pending_token'];

    if (!fbToken) {
        console.error(" FB Pages Error: No token found in Query or Cookie");
        throw new UnauthorizedException('Facebook session missing. Please reconnect.');
    }

    return this.socialAccountsService.getFacebookPages(fbToken);
  }

  @Post('facebook/pages/select')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Connect a specific Facebook Page' })
  async selectFacebookPage(@Req() req, @Body() body: { pageId: string, pageName: string, pageAccessToken: string }) {
    req.res.clearCookie('fb_pending_token', { sameSite: 'none', secure: true });
    return this.socialAccountsService.linkPageAccount(req.user.sub, body);
  }

  // =================================================================
  // 3. OTHER OAUTH FLOWS (LinkedIn, TikTok, YouTube)
  // =================================================================
  // (Kept exactly as you had them)

  @Get('connect/linkedin')
  async connectLinkedIn(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new UnauthorizedException('No auth token provided');
    try {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;
        res.cookie('auth_state', userId, { httpOnly: true, signed: true, maxAge: 300000, sameSite: 'none', secure: true });
        res.redirect('/api/social-accounts/auth/linkedin');
    } catch (e) { throw new UnauthorizedException('Invalid Token'); }
  }

  @Get('auth/linkedin')
  @UseGuards(LinkedInConnectGuard)
  linkedinTrigger() {}

  @Get('callback/linkedin')
  @UseGuards(LinkedInConnectGuard)
  async linkedinCallback(@Req() req, @Res() res: any) {
    await this.handleCallback(req, res, 'linkedin');
  }

  @Get('connect/tiktok')
  async connectTikTok(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new UnauthorizedException('No auth token provided');
    try {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;
        res.cookie('auth_state', userId, { httpOnly: true, signed: true, maxAge: 300000, sameSite: 'none', secure: true });
        res.redirect('/api/social-accounts/auth/tiktok');
    } catch (e) { throw new UnauthorizedException('Invalid Token'); }
  }

  @Get('auth/tiktok')
  @UseGuards(TikTokConnectGuard)
  tiktokTrigger() {}

  @Get('callback/tiktok')
  @UseGuards(TikTokConnectGuard)
  async tiktokCallback(@Req() req, @Res() res: any) {
    await this.handleCallback(req, res, 'tiktok');
  }

  @Get('connect/youtube')
  async connectYoutube(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new UnauthorizedException('No auth token provided');
    try {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;
        res.cookie('auth_state', userId, { httpOnly: true, signed: true, maxAge: 300000, sameSite: 'none', secure: true });
        res.redirect('/api/social-accounts/auth/youtube');
    } catch (e) { throw new UnauthorizedException('Invalid Token'); }
  }

  @Get('auth/youtube')
  @UseGuards(AuthGuard('youtube-connect'))
  youtubeTrigger() {}

  @Get('callback/youtube')
  @UseGuards(AuthGuard('youtube-connect'))
  async youtubeCallback(@Req() req, @Res() res: any) {
    await this.handleCallback(req, res, 'youtube');
  }

  private async handleCallback(req: any, res: any, platform: string) {
    const profile = req.user;
    const userId = req.signedCookies['auth_state'];

    if (!userId) {
       console.error(`❌ Missing Auth Cookie for ${platform}`);
       const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
       return res.redirect(`${frontendUrl}/dashboard?error=session_expired`);
    }

    await this.socialAccountsService.linkAccount(userId, profile);
    res.clearCookie('auth_state', { sameSite: 'none', secure: true });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/dashboard?social_connected=true&platform=${platform}`);
  }
}
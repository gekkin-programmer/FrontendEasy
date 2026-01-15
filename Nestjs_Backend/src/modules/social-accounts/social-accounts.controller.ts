import { 
  Controller, 
  Get, 
  Post, // Added POST
  Body, // Added Body
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
  // 1. LIST & MANAGE ACCOUNTS (Keep Guard here - API calls)
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
    // 1. Get the User Access Token from Passport
    const { accessToken } = req.user; 

    // 2. Store Token in a short-lived Cookie so we can fetch pages later
    res.cookie('fb_pending_token', accessToken, { 
        httpOnly: true, 
        signed: true, 
        maxAge: 300000, // 5 mins
        sameSite: 'none', 
        secure: true 
    });

    // 3. Redirect to Frontend Selection Modal
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/dashboard?social_selection=facebook`);
  }

  @Get('facebook/pages')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List Facebook Pages to select' })
  async listFacebookPages(@Req() req) {
    // Get the token we saved in the cookie
    const fbToken = req.signedCookies['fb_pending_token'];
    if (!fbToken) throw new UnauthorizedException('Facebook session expired. Please connect again.');

    // Fetch pages (Needs implementation in Service)
    return this.socialAccountsService.getFacebookPages(fbToken);
  }

  @Post('facebook/pages/select')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Connect a specific Facebook Page' })
  async selectFacebookPage(@Req() req, @Body() body: { pageId: string, pageName: string, pageAccessToken: string }) {
    // Save the specific Page Account to the DB
    // Clear pending cookie
    req.res.clearCookie('fb_pending_token', { sameSite: 'none', secure: true });
    
    return this.socialAccountsService.linkPageAccount(req.user.sub, body);
  }

  // =================================================================
  // 3. LINKEDIN FLOW
  // =================================================================

  @Get('connect/linkedin')
  @ApiOperation({ summary: 'Initiate LinkedIn OAuth' })
  async connectLinkedIn(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new UnauthorizedException('No auth token provided');

    try {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;

        res.cookie('auth_state', userId, { httpOnly: true, signed: true, maxAge: 300000, sameSite: 'none', secure: true });
        res.redirect('/api/social-accounts/auth/linkedin');
    } catch (e) {
        throw new UnauthorizedException('Invalid Token');
    }
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
  @ApiOperation({ summary: 'Initiate TikTok OAuth' })
  async connectTikTok(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new UnauthorizedException('No auth token provided');

    try {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;

        res.cookie('auth_state', userId, { httpOnly: true, signed: true, maxAge: 300000, sameSite: 'none', secure: true });
        res.redirect('/api/social-accounts/auth/tiktok');
    } catch (e) {
        throw new UnauthorizedException('Invalid Token');
    }
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
  @ApiOperation({ summary: 'Initiate YouTube OAuth' })
  async connectYoutube(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new UnauthorizedException('No auth token provided');

    try {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;

        res.cookie('auth_state', userId, { httpOnly: true, signed: true, maxAge: 300000, sameSite: 'none', secure: true });
        res.redirect('/api/social-accounts/auth/youtube');
    } catch (e) {
        throw new UnauthorizedException('Invalid Token');
    }
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
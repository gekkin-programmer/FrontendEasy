import { 
  Controller, 
  Get, 
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
  //  Guard Removed to allow Browser Redirect
  async connectFacebook(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new UnauthorizedException('No auth token provided');

    try {
        // 1. Manually Verify Token
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;

        // 2. Save User ID to Cookie
        res.cookie('auth_state', userId, { 
            httpOnly: true, 
            signed: true, 
            maxAge: 300000,
            sameSite: 'none', 
            secure: true      
        });
        
        // 3. Redirect to internal route
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
    await this.handleCallback(req, res, 'facebook');
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
       console.error(` Missing Auth Cookie for ${platform}`);
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
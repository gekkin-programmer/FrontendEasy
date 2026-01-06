import { Controller, Get, UseGuards, Req, Res, Query, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialAccountsService } from './social-accounts.service';
import { FacebookConnectGuard } from './guards/facebook-connect.guard';
import { LinkedInConnectGuard } from './guards/linkedin-connect.guard';
import { TikTokConnectGuard } from './guards/tiktok-connect.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

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
  @ApiOperation({ summary: 'List connected Facebook/LinkedIn accounts' })
  findAll(@Req() req) {
    return this.socialAccountsService.findAll(req.user.sub);
  }
  @Get('connect/tiktok')
  @UseGuards(TikTokConnectGuard)
  @ApiOperation({ summary: 'Connect TikTok' })
  connectTikTok() {}

    // ➤ CALLBACK TIKTOK
  @Get('callback/tiktok')
  @UseGuards(TikTokConnectGuard)
  @ApiOperation({ summary: 'TikTok Callback' })
  async tiktokCallback(@Req() req, @Res() res: any) {
    const profile = req.user;
    const TARGET_USER_ID = "cmk0x896a0000uuxoygl7qflv"; 

    await this.socialAccountsService.linkAccount(TARGET_USER_ID, profile);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/dashboard?social_connected=true&platform=tiktok`);
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
  @UseGuards(FacebookConnectGuard)
  @ApiOperation({ summary: 'Start Facebook Connection Flow' })
  connectFacebook() {
    // Redirects to FB automatically
  }

  @Get('callback/facebook')
  @UseGuards(FacebookConnectGuard)
  @ApiOperation({ summary: 'Facebook Redirects back here' })
  async facebookCallback(@Req() req, @Res() res: any) {
    const fbProfile = req.user;
    
    // 🛑 DEV: Hardcoded ID. In prod, use req.cookies['auth_state']
    const TARGET_USER_ID = "cmk0x896a0000uuxoygl7qflv"; 

    await this.socialAccountsService.linkAccount(TARGET_USER_ID, fbProfile);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/dashboard?social_connected=true&platform=facebook`);
  }

  // =================================================================
  // 3. LINKEDIN FLOW
  // =================================================================

  @Get('connect/linkedin')
  @UseGuards(LinkedInConnectGuard)
  @ApiOperation({ summary: 'Start LinkedIn Connection Flow' })
  connectLinkedIn() {
    // Redirects to LinkedIn automatically
  }

  @Get('callback/linkedin')
  @UseGuards(LinkedInConnectGuard)
  @ApiOperation({ summary: 'LinkedIn Redirects back here' })
  async linkedinCallback(@Req() req, @Res() res: any) {
    const liProfile = req.user;
    
    // 🛑 DEV: Hardcoded ID
    const TARGET_USER_ID = "cmk0x896a0000uuxoygl7qflv"; 

    await this.socialAccountsService.linkAccount(TARGET_USER_ID, liProfile);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/dashboard?social_connected=true&platform=linkedin`);
  }
}